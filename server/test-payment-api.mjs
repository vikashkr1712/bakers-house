import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { resolve } from 'node:path'
import { buildOrderRequest } from '../src/utils/whatsappOrder.js'
import { ORDERING_CONFIG } from '../src/config/ordering.js'
import { createRuntimeOrderStore } from './order-store.mjs'
import { buildCheckoutWhatsAppSummary, isOrderHandoffReady } from './order-summary.mjs'

const ROOT = '/api/orders'
const LEGACY_ROOT = '/api/test-orders'
const MAX_BODY = 64 * 1024
const DEFAULT_HOSTS = ['localhost', '127.0.0.1', '[::1]', 'f1n8041h-5000.inc1.devtunnels.ms']
const hash = value => createHash('sha256').update(value).digest('hex')
class OrderError extends Error { constructor(message, status = 400) { super(message); this.status = status } }
export function normalizeCustomerPhone(value) {
  const text = String(value ?? '').trim()
  if (!/^\+?[\d\s().-]+$/.test(text)) throw new OrderError('Enter a valid WhatsApp number including its country code.')
  let digits = text.replace(/\D/g, '')
  if (digits.length === 10) digits = `91${digits}`
  if (!/^[1-9]\d{9,14}$/.test(digits)) throw new OrderError('Enter a valid WhatsApp number including its country code.')
  return digits
}
function settings(env) {
  const keyId = String(env.RAZORPAY_KEY_ID || '').trim()
  const keySecret = String(env.RAZORPAY_KEY_SECRET || '').trim()
  let whatsappNumber
  try { whatsappNumber = normalizeCustomerPhone(env.BAKERY_WHATSAPP_NUMBER || ORDERING_CONFIG.whatsappNumber) } catch { whatsappNumber = null }
  return { keyId, keySecret, configured: /^rzp_test_[A-Za-z0-9]+$/.test(keyId) && keySecret.length > 0 && keySecret.length <= 512, webhookSecret: String(env.RAZORPAY_WEBHOOK_SECRET || '').trim(), staffToken: String(env.BAKERY_STAFF_TOKEN || '').trim(), whatsappNumber }
}
function json(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(JSON.stringify(payload))
}
function rawBody(req) {
  // Platforms may supply exact bytes. Never JSON.stringify a parsed body:
  // doing that would change the bytes authenticated by the gateway HMAC.
  const bodyValue = Object.getOwnPropertyDescriptor(req, 'body')?.value
  const supplied = Buffer.isBuffer(req.rawBody) || typeof req.rawBody === 'string' ? req.rawBody : Buffer.isBuffer(bodyValue) || typeof bodyValue === 'string' ? bodyValue : null
  if (supplied !== null) {
    const bytes = Buffer.isBuffer(supplied) ? supplied : Buffer.from(supplied, 'utf8')
    return bytes.length > MAX_BODY ? Promise.reject(new OrderError('The order request is too large.', 413)) : Promise.resolve(bytes)
  }
  if (req.readableEnded && bodyValue && typeof bodyValue === 'object') return Promise.reject(new OrderError('Raw request bytes are required to verify this request.'))
  return new Promise((resolveBody, reject) => {
    let size = 0, done = false
    const chunks = []
    const finish = (error, data) => {
      if (done) return
      done = true; clearTimeout(timer)
      req.off('data', onData); req.off('end', onEnd); req.off('error', onError); req.off('aborted', onError)
      if (error) { req.resume(); reject(error) } else resolveBody(data)
    }
    const onData = chunk => { size += chunk.length; if (size > MAX_BODY) finish(new OrderError('The order request is too large.', 413)); else chunks.push(chunk) }
    const onEnd = () => finish(null, Buffer.concat(chunks))
    const onError = () => finish(new OrderError('The order request was interrupted.'))
    const timer = setTimeout(() => finish(new OrderError('The order request timed out.', 408)), 10000)
    timer.unref?.()
    req.on('data', onData); req.on('end', onEnd); req.on('error', onError); req.on('aborted', onError)
  })
}
function parseBody(raw) {
  try { const body = JSON.parse(raw.toString('utf8')); if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error(); return body }
  catch { throw new OrderError('Send a valid JSON order request.') }
}
function originAllowed(req, hosts) {
  try {
    const host = new URL(`http://${req.headers.host}`)
    if (!hosts.has(host.hostname)) return false
    if (!req.headers.origin) return true
    const origin = new URL(req.headers.origin)
    return ['http:', 'https:'].includes(origin.protocol) && origin.host === host.host
  } catch { return false }
}
export function isPaymentLinkUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && ['rzp.io', 'rzp.in'].includes(url.hostname) && !url.username && !url.password && !url.port && url.pathname.length > 1 && !url.hash }
  catch { return false }
}
function matchesHash(token, expectedHash) {
  return typeof token === 'string' && token.length >= 32 && token.length <= 128 && /^[a-f0-9]{64}$/.test(expectedHash || '') && timingSafeEqual(Buffer.from(hash(token), 'hex'), Buffer.from(expectedHash, 'hex'))
}

function checkoutCallback(req, value, env) {
  const path = value === undefined ? '/checkout' : value
  if (typeof path !== 'string' || path.length > 2048 || !/^\/checkout(?:\?|$)/.test(path) || /[\\\u0000-\u001f\u007f]/.test(path)) throw new OrderError('Use a valid checkout return path.')
  const parsed = new URL(path, 'https://checkout.invalid')
  if (parsed.pathname !== '/checkout' || parsed.hash || parsed.origin !== 'https://checkout.invalid') throw new OrderError('Use a valid checkout return path.')
  for (const key of parsed.searchParams.keys()) if (!['item', 'quantity'].includes(key) || parsed.searchParams.getAll(key).length !== 1) throw new OrderError('The checkout return path contains unsupported parameters.')
  if (parsed.searchParams.has('item') && (!parsed.searchParams.get('item') || parsed.searchParams.get('item').length > 1500)) throw new OrderError('The checkout selection return path is invalid.')
  if (parsed.searchParams.has('quantity') && (!/^[1-9]\d?$/.test(parsed.searchParams.get('quantity')) || !parsed.searchParams.has('item'))) throw new OrderError('The checkout quantity return path is invalid.')
  let base
  try {
    base = new URL(env.ORDER_PUBLIC_BASE_URL || req.headers.origin || `${req.socket.encrypted ? 'https' : 'http'}://${req.headers.host}`)
  } catch { throw new OrderError('The checkout return address is not configured.', 503) }
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)
  if (base.username || base.password || base.search || base.hash || base.pathname !== '/' || base.protocol !== 'https:' && !(local && base.protocol === 'http:')) throw new OrderError('Configure a secure checkout return address.', 503)
  return new URL(`${parsed.pathname}${parsed.search}`, base.origin).href
}

export function createTestOrderMiddleware({ env = process.env, fetchImpl = globalThis.fetch, storePath, legacyPath, now = Date.now, allowedHosts, pollIntervalMs = 2000 } = {}) {
  const config = settings(env)
  const hosts = new Set(allowedHosts || [...DEFAULT_HOSTS, ...String(env.ORDER_ALLOWED_HOSTS || '').split(',').map(value => value.trim()).filter(Boolean)])
  const store = createRuntimeOrderStore({ env, path: storePath || resolve(env.ORDER_DATABASE_PATH || '.payment-data/orders.sqlite'), ...(legacyPath ? { legacyPath } : {}) })
  const buckets = new Map()
  const time = () => Number(now())
  const isoNow = () => new Date(time()).toISOString()

  function publicOrder(order, accessToken) {
    const handoffReady = isOrderHandoffReady(order)
    const orderSummary = handoffReady ? buildCheckoutWhatsAppSummary(order) : null
    return {
      id: order.id, ...(accessToken ? { accessToken } : {}), reference: order.reference,
      paymentMethod: order.paymentMethod, status: order.status, paymentStatus: order.paymentStatus,
      amount: order.amount, currency: 'INR', paymentUrl: order.paymentUrl || null,
      customerPhone: order.customerPhone, mode: 'test', createdAt: order.createdAt,
      paidAt: order.paidAt || null, ...(order.paymentId ? { paymentId: order.paymentId } : {}),
      messagingMode: 'customer_to_bakery', whatsappNumber: config.whatsappNumber,
      handoffReady, orderSummary,
      whatsappUrl: orderSummary && config.whatsappNumber ? `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(orderSummary)}` : null,
    }
  }
  function throttle(identity, limit = 30) {
    const key = identity || 'local'
    const previous = buckets.get(key)
    if (previous && time() - previous.started < 60000 && previous.count >= limit) throw new OrderError('Too many requests. Please wait a minute.', 429)
    buckets.set(key, previous && time() - previous.started < 60000 ? { ...previous, count: previous.count + 1 } : { started: time(), count: 1 })
    if (buckets.size > 1000) for (const [bucketKey, bucket] of buckets) if (time() - bucket.started >= 60000) buckets.delete(bucketKey)
  }
  async function provider(path, init = {}) {
    let response
    try { response = await fetchImpl(`https://api.razorpay.com/v1/${path}`, { ...init, redirect: 'error', headers: { Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64')}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000) }) }
    catch { throw new OrderError('Razorpay Test Mode could not be reached. Please try again.', 502) }
    if (!response.ok) throw new OrderError('Razorpay Test Mode could not complete this request. Check the test account setup.', 502)
    try { return await response.json() } catch { throw new OrderError('Razorpay Test Mode returned an unreadable response.', 502) }
  }
  function validateLink(link, order) {
    if (!/^plink_[A-Za-z0-9]+$/.test(link?.id || '') || link.reference_id !== order.reference || link.amount !== order.amount || link.currency !== 'INR' || !isPaymentLinkUrl(link.short_url) || order.providerLinkId && link.id !== order.providerLinkId) throw new OrderError('The test payment link does not match this order.', 502)
  }
  async function makeLink(order, recovering) {
    if (recovering) {
      const result = await provider(`payment_links?reference_id=${encodeURIComponent(order.reference)}`)
      if (!Array.isArray(result.payment_links)) throw new OrderError('The earlier payment request could not be checked.', 502)
      const matching = result.payment_links.filter(link => link.reference_id === order.reference)
      if (matching.length > 1) throw new OrderError('This payment reference needs review before retrying.', 409)
      if (matching.length) { validateLink(matching[0], order); return matching[0] }
    }
    const link = await provider('payment_links', { method: 'POST', body: JSON.stringify({
      amount: order.amount, currency: 'INR', accept_partial: false, reference_id: order.reference,
      description: `${ORDERING_CONFIG.bakeryName} TEST order ${order.reference} — no real payment`,
      customer: { name: order.request.fields.name, contact: `+${order.customerPhone}` },
      notify: { sms: false, email: false }, reminder_enable: false,
      expire_by: Math.floor(time() / 1000) + 86400,
      notes: { purpose: 'Test order only', local_order_id: order.id },
      callback_url: order.callbackUrl, callback_method: 'get',
    }) })
    validateLink(link, order)
    return link
  }
  async function reconcile(order, force = false) {
    if (order.paymentMethod !== 'payment-link' || !order.providerLinkId || order.paymentStatus === 'paid') return
    if (!config.configured) throw new OrderError('Razorpay Test Mode is not configured. Payment cannot be verified.', 503)
    if (!force && order.lastCheckedAt && time() - order.lastCheckedAt < pollIntervalMs) return
    const link = await provider(`payment_links/${order.providerLinkId}`)
    validateLink(link, order)
    if (link.status === 'paid') {
      if (link.amount_paid !== order.amount || link.accept_partial === true) throw new OrderError('The full test payment amount has not been verified.', 409)
      const record = (Array.isArray(link.payments) ? link.payments : []).find(payment => /^pay_[A-Za-z0-9]+$/.test(payment.payment_id || '') && payment.plink_id === order.providerLinkId && payment.status === 'captured' && payment.amount === order.amount)
      if (!record) throw new OrderError('The test payment is not captured yet. Please check again shortly.', 409)
      const payment = await provider(`payments/${record.payment_id}`)
      if (payment.id !== record.payment_id || payment.status !== 'captured' || payment.captured !== true || payment.amount !== order.amount || payment.currency !== 'INR') throw new OrderError('The test payment details could not be verified for this order.', 409)
      order.status = 'awaiting_bakery_confirmation'; order.paymentStatus = 'paid'; order.paymentId = payment.id; order.paidAt = isoNow()
    } else if (['expired', 'cancelled'].includes(link.status)) {
      order.status = link.status; order.paymentStatus = 'unpaid'
    } else {
      order.status = 'awaiting_payment'; order.paymentStatus = link.status === 'partially_paid' ? 'pending' : 'unpaid'
    }
    order.lastCheckedAt = time()
    await store.save(order)
  }
  const middleware = async function orderMiddleware(req, res, next) {
    let url
    try { url = new URL(req.url, 'http://localhost') } catch { return next() }
    const originalPath = url.pathname
    const path = originalPath === LEGACY_ROOT || originalPath.startsWith(`${LEGACY_ROOT}/`) ? ROOT + originalPath.slice(LEGACY_ROOT.length) : originalPath
    const staffRoute = path === '/api/staff/orders'
    if (!staffRoute && path !== ROOT && !path.startsWith(`${ROOT}/`)) return next()
    try {
      const webhook = path === `${ROOT}/webhook`
      if (!webhook && !originAllowed(req, hosts)) throw new OrderError('Order requests must come from this website.', 403)
      if (path === `${ROOT}/config` && req.method === 'GET') return json(res, 200, { configured: config.configured && store.configured, storageConfigured: store.configured, storageProvider: store.provider, mode: 'test', messagingMode: 'customer_to_bakery', whatsappNumber: config.whatsappNumber, codEnabled: ORDERING_CONFIG.delivery.cashOnDelivery === true, payAtPickup: ORDERING_CONFIG.payAtPickup === true })
      if (!store.configured) throw new OrderError('Persistent order storage is not configured. Please try again later.', 503)
      if (staffRoute) {
        if (req.method !== 'GET') throw new OrderError('Use GET to check a saved order.', 405)
        throttle(`staff:${req.socket.remoteAddress}`)
        const token = req.headers.authorization?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1]
        if (config.staffToken.length < 32 || !matchesHash(token, hash(config.staffToken))) throw new OrderError('Staff authentication is required.', 401)
        const reference = url.searchParams.get('reference')
        if (!/^BH-[a-f0-9]{32}$/.test(reference || '')) throw new OrderError('Enter a valid order reference.')
        const outcome = await store.serialized(async () => {
          const order = await store.byReference(reference)
          if (!order) throw new OrderError('This order was not found.', 404)
          await reconcile(order)
          return { ...publicOrder(order), details: order.request }
        })
        return json(res, 200, outcome)
      }
      if (webhook) {
        if (req.method !== 'POST') throw new OrderError('Use POST for payment events.', 405)
        if (!config.webhookSecret || !config.configured) throw new OrderError('Test payment webhooks are not configured.', 503)
        const raw = await rawBody(req)
        const signature = req.headers['x-razorpay-signature']
        if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature) || !timingSafeEqual(createHmac('sha256', config.webhookSecret).update(raw).digest(), Buffer.from(signature, 'hex'))) throw new OrderError('The payment event signature is invalid.', 400)
        const body = parseBody(raw)
        const supplied = req.headers['x-razorpay-event-id']
        const eventId = typeof supplied === 'string' && supplied.length <= 200 ? supplied : hash(raw)
        const outcome = await store.serialized(async () => {
          if (await store.hasEvent(eventId)) return { received: true, duplicate: true }
          if (['payment_link.paid', 'payment_link.partially_paid', 'payment_link.expired', 'payment_link.cancelled'].includes(body.event)) {
            const order = await store.byLink(body.payload?.payment_link?.entity?.id || '')
            if (order) await reconcile(order, true)
          }
          await store.recordEvent(eventId, time())
          return { received: true }
        })
        return json(res, 200, outcome)
      }
      if (path === ROOT && req.method === 'POST') {
        throttle(req.socket.remoteAddress)
        if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) throw new OrderError('Send a JSON order request.', 415)
        const body = parseBody(await rawBody(req))
        if (typeof body.idempotencyKey !== 'string' || !/^[A-Za-z0-9_-]{16,128}$/.test(body.idempotencyKey)) throw new OrderError('Refresh checkout and try again with a valid request reference.')
        if (!['cod', 'payment-link'].includes(body.paymentMethod)) throw new OrderError('Choose cash or online payment.')
        if (body.paymentMethod === 'payment-link' && !config.configured) throw new OrderError('Razorpay Test Mode is unavailable. Choose cash or try again later.', 503)
        if (!config.whatsappNumber) throw new OrderError('The bakery WhatsApp number is not configured.', 503)
        const customerPhone = normalizeCustomerPhone(body.fields?.phone)
        const callbackUrl = body.paymentMethod === 'payment-link' ? checkoutCallback(req, body.returnPath, env) : null
        let request
        try { request = buildOrderRequest({ ...body, fields: { ...body.fields, phone: `+${customerPhone}` }, now: new Date(time()) }) }
        catch (error) { throw new OrderError(error.message || 'Review your order details and try again.') }
        if (request.totals.needsPriceConfirmation) throw new OrderError('Every item needs a confirmed price. Remove unpriced selections.')
        const amount = Math.round(request.totals.total * 100)
        if (!Number.isSafeInteger(amount) || amount < 100 || amount > 50000000) throw new OrderError('The order total must be between ₹1 and ₹5,00,000.')
        const payloadHash = hash(JSON.stringify({ fingerprint: request.fingerprint, callbackUrl }))
        const keyHash = hash(body.idempotencyKey)
        const outcome = await store.serialized(async () => {
          let order = await store.byKey(keyHash)
          if (order && order.payloadHash !== payloadHash) throw new OrderError('This checkout reference belongs to different details. Start a new checkout.', 409)
          const recovering = Boolean(order)
          if (!order) {
            if ((await store.count()) >= 10000) throw new OrderError('The local order store needs maintenance.', 429)
            const id = randomUUID(), reference = `BH-${randomUUID().replaceAll('-', '')}`
            const accessToken = hash(`checkout-v2:${body.idempotencyKey}:${id}:${reference}`)
            order = { id, reference, accessTokenHash: hash(accessToken), idempotencyHash: keyHash, payloadHash, request, callbackUrl, customerPhone, amount, currency: 'INR', paymentMethod: body.paymentMethod, status: body.paymentMethod === 'cod' ? 'awaiting_bakery_confirmation' : 'awaiting_payment', paymentStatus: 'unpaid', createdAt: isoNow(), paymentUrl: null, providerLinkId: null }
            await store.save(order)
          }
          const accessToken = hash(`checkout-v2:${body.idempotencyKey}:${order.id}:${order.reference}`)
          if (!matchesHash(accessToken, order.accessTokenHash)) throw new OrderError('Resume this older checkout using its original saved order access.', 409)
          if (order.paymentMethod === 'payment-link' && !order.paymentUrl) {
            const link = await makeLink(order, recovering)
            order.providerLinkId = link.id; order.paymentUrl = link.short_url
            await store.save(order)
          }
          return publicOrder(order, accessToken)
        })
        return json(res, 200, outcome)
      }
      const match = new RegExp(`^${ROOT}/([a-f0-9-]{36})$`).exec(path)
      if (match && req.method === 'GET') {
        const token = req.headers.authorization?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1]
        const outcome = await store.serialized(async () => {
          const order = await store.get(match[1])
          if (!order || !matchesHash(token, order.accessTokenHash)) throw new OrderError('This order could not be accessed.', 404)
          await reconcile(order)
          return publicOrder(order)
        })
        return json(res, 200, outcome)
      }
      throw new OrderError('Order route not found.', 404)
    } catch (error) {
      if (!res.writableEnded) json(res, error instanceof OrderError ? error.status : error.code === 'ORDER_STORAGE_UNAVAILABLE' ? 503 : 500, { error: error instanceof OrderError ? error.message : error.code === 'ORDER_STORAGE_UNAVAILABLE' ? 'The order database is temporarily unavailable. Please try again.' : 'The order could not be completed. Please try again.' })
    }
  }
  middleware.reconcilePending = async () => {
    if (!config.configured || !store.configured) return
    await store.serialized(async () => { for (const order of await store.pending(5)) { try { await reconcile(order) } catch { /* A later check retries; failure never marks payment successful. */ } } })
  }
  middleware.close = () => store.close()
  return middleware
}

export const createOrderMiddleware = createTestOrderMiddleware
export function testPaymentApiPlugin(env) {
  const middleware = createTestOrderMiddleware({ env })
  let timer
  const attach = server => {
    server.middlewares.use(middleware)
    clearInterval(timer)
    timer = setInterval(() => middleware.reconcilePending().catch(() => {}), 15000)
    timer.unref?.()
    server.httpServer?.once('close', () => { clearInterval(timer); middleware.close() })
  }
  return { name: 'bakers-house-order-checkout', configureServer: attach, configurePreviewServer: attach, closeBundle() { clearInterval(timer); middleware.close() } }
}
