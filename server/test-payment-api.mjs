import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { buildOrderRequest } from '../src/utils/whatsappOrder.js'
import { ORDERING_CONFIG } from '../src/config/ordering.js'
import { createWhatsAppMessenger, CUSTOMER_SERVICE_WINDOW_MS } from './whatsapp-messaging.mjs'

const ROOT = '/api/test-orders'
const MAX_BODY = 64 * 1024
const DEFAULT_HOSTS = ['localhost', '127.0.0.1', '[::1]', 'f1n8041h-5000.inc1.devtunnels.ms']
const hash = value => createHash('sha256').update(value).digest('hex')

class OrderError extends Error {
  constructor(message, status = 400) { super(message); this.status = status }
}

export function normalizeCustomerPhone(value) {
  let digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length === 10) digits = `91${digits}`
  if (!/^[1-9]\d{9,14}$/.test(digits)) throw new OrderError('Enter a valid WhatsApp number including its country code.')
  return digits
}

function settings(env) {
  const keyId = (env.RAZORPAY_KEY_ID || '').trim()
  const keySecret = (env.RAZORPAY_KEY_SECRET || '').trim()
  return { keyId, keySecret, configured: /^rzp_test_[A-Za-z0-9]+$/.test(keyId) && keySecret.length > 0 && keySecret.length <= 512, webhookSecret: (env.RAZORPAY_WEBHOOK_SECRET || '').trim(), whatsappAppSecret: (env.WHATSAPP_APP_SECRET || '').trim(), whatsappVerifyToken: (env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '').trim(), whatsappPhoneId: (env.WHATSAPP_PHONE_NUMBER_ID || '').trim() }
}

function json(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(JSON.stringify(payload))
}

function rawBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = []
    let size = 0
    let done = false
    const finish = (error, data) => {
      if (done) return
      done = true
      clearTimeout(timer)
      req.off('data', dataListener); req.off('end', endListener); req.off('error', errorListener); req.off('aborted', errorListener)
      if (error) { req.resume(); reject(error) } else resolveBody(data)
    }
    const dataListener = chunk => { size += chunk.length; if (size > MAX_BODY) finish(new OrderError('The order request is too large.', 413)); else chunks.push(chunk) }
    const endListener = () => finish(null, Buffer.concat(chunks))
    const errorListener = () => finish(new OrderError('The order request was interrupted.'))
    const timer = setTimeout(() => finish(new OrderError('The order request timed out.', 408)), 10000)
    timer.unref?.()
    req.on('data', dataListener); req.on('end', endListener); req.on('error', errorListener); req.on('aborted', errorListener)
  })
}

function parseBody(raw) {
  try { const value = JSON.parse(raw.toString('utf8')); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value }
  catch { throw new OrderError('Send a valid JSON order request.') }
}

function originAllowed(req, allowedHosts) {
  try {
    const host = new URL(`http://${req.headers.host}`)
    if (!allowedHosts.has(host.hostname)) return false
    if (!req.headers.origin) return true
    const origin = new URL(req.headers.origin)
    return ['https:', 'http:'].includes(origin.protocol) && origin.host === host.host
  } catch { return false }
}

export function isPaymentLinkUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && ['rzp.io', 'rzp.in'].includes(url.hostname) && !url.username && !url.password && !url.port && url.pathname.length > 1 }
  catch { return false }
}

function publicOrderResponse(order, includeToken = false, whatsapp = {}) {
  return {
    id: order.id, ...(includeToken ? { accessToken: order.accessToken } : {}), reference: order.reference,
    status: order.status, paymentStatus: order.paymentStatus, amount: order.amount, currency: 'INR',
    paymentUrl: order.paymentUrl, customerPhone: order.customerPhone, mode: 'test', createdAt: order.createdAt,
    confirmedAt: order.confirmedAt || null, ...(order.paymentId ? { paymentId: order.paymentId } : {}),
    messageDelivery: order.messageDelivery || { status: 'not_configured', recipient: order.customerPhone },
    confirmationDelivery: order.confirmationDelivery || { status: 'not_configured', recipient: order.customerPhone },
    messagingMode: 'customer_initiated', whatsappNumber: whatsapp.number,
    whatsappConfigured: whatsapp.configured === true,
    customerServiceWindowExpiresAt: order.whatsappConversation?.expiresAt || null,
  }
}

function tokenMatches(token, expected) {
  if (typeof token !== 'string' || token.length < 32 || token.length > 128) return false
  return timingSafeEqual(Buffer.from(hash(token), 'hex'), Buffer.from(hash(expected), 'hex'))
}

function createStore(filePath) {
  let queue = Promise.resolve()
  return {
    transact(action) {
      const work = queue.then(async () => {
        let db
        try { db = JSON.parse(await readFile(filePath, 'utf8')) }
        catch (error) { if (error.code !== 'ENOENT') throw new OrderError('The local order store could not be read. Please try again.', 503); db = { version: 1, orders: [], webhookEvents: [] } }
        if (db.version !== 1 || !Array.isArray(db.orders) || !Array.isArray(db.webhookEvents)) throw new OrderError('The local order store is unavailable.', 503)
        const persist = async () => {
          await mkdir(dirname(filePath), { recursive: true })
          const temporary = `${filePath}.${randomUUID()}.tmp`
          await writeFile(temporary, JSON.stringify(db), { encoding: 'utf8', mode: 0o600 })
          await rename(temporary, filePath)
        }
        return action(db, persist)
      })
      queue = work.catch(() => {})
      return work
    },
  }
}

export function createTestOrderMiddleware({ env = process.env, fetchImpl = globalThis.fetch, storePath = resolve('.payment-data/orders.json'), now = Date.now, allowedHosts = DEFAULT_HOSTS, pollIntervalMs = 2000 } = {}) {
  const config = settings(env)
  const hosts = new Set(allowedHosts)
  const store = createStore(storePath)
  const requestBuckets = new Map()
  const monotonic = () => Number(now())
  const dateNow = () => new Date(monotonic())
  const messenger = createWhatsAppMessenger({ env, fetchImpl, now: dateNow })
  const whatsappNumber = /^[1-9]\d{9,14}$/.test(messenger.businessNumber) ? messenger.businessNumber : ORDERING_CONFIG.whatsappNumber
  const publicOrder = (order, includeToken = false) => publicOrderResponse(order, includeToken, { number: whatsappNumber, configured: messenger.configured })

  async function sendMessage(order, kind, persist, manual = false) {
    const key = kind === 'payment' ? 'messageDelivery' : 'confirmationDelivery'
    const previous = order[key]
    const configured = kind === 'payment' ? messenger.configured : messenger.confirmationConfigured
    if (!order.whatsappConsent) return
    if (!configured) {
      if (!previous || previous.status === 'not_configured') {
        order[key] = { status: 'not_configured', recipient: order.customerPhone }
        await persist()
      }
      return
    }
    if (previous && ['accepted', 'sent', 'delivered', 'read', 'unknown'].includes(previous.status)) {
      if (manual && previous.status === 'unknown') throw new OrderError('The earlier send result is uncertain. Check WhatsApp before requesting another message.', 409)
      return
    }
    if (previous?.status === 'sending') {
      if (monotonic() - Date.parse(previous.attemptedAt) > 120000) {
        order[key] = { ...previous, status: 'unknown', error: 'The earlier message result is uncertain. Check WhatsApp before retrying.' }
        await persist()
      }
      return
    }
    const window = messenger.windowState(order, order.customerPhone)
    if (window !== 'active') {
      if (previous?.status !== window) {
        order[key] = { status: window, recipient: order.customerPhone }
        await persist()
      }
      if (manual) throw new OrderError(window === 'window_expired' ? 'The WhatsApp reply window has closed. Send your order reference to the bakery again.' : 'Send your order reference to the bakery from the checkout WhatsApp number first.', 409)
      return
    }
    if (previous?.status === 'failed' && !manual && (!previous.retryable || previous.attempts >= 3)) return
    if (previous?.retryAfterAt && monotonic() < Date.parse(previous.retryAfterAt)) {
      if (manual) throw new OrderError('Please wait before retrying this WhatsApp message.', 429)
      return
    }
    order[key] = { status: 'sending', recipient: order.customerPhone, attempts: (previous?.attempts || 0) + 1, attemptedAt: dateNow().toISOString() }
    await persist()
    try {
      const result = await messenger[kind === 'payment' ? 'sendPaymentLink' : 'sendConfirmation']({ ...order, mode: 'test' })
      order[key] = { ...order[key], ...result, retryable: false }
    } catch (error) {
      const retryable = error.definitive === true && error.retryable === true
      order[key] = { ...order[key], status: error.definitive === true ? 'failed' : 'unknown', error: error.message || 'WhatsApp could not send this message.', retryable, retryAfterAt: new Date(monotonic() + (retryable ? Math.min(300000, 60000 * order[key].attempts) : 30000)).toISOString() }
    }
    await persist()
  }

  async function whatsappWebhook(req, res) {
    if (req.method === 'GET') {
      const params = new URL(req.url, 'http://localhost').searchParams
      const supplied = params.get('hub.verify_token') || ''
      if (params.get('hub.mode') !== 'subscribe' || !config.whatsappVerifyToken || !timingSafeEqual(Buffer.from(hash(supplied), 'hex'), Buffer.from(hash(config.whatsappVerifyToken), 'hex'))) throw new OrderError('WhatsApp webhook verification failed.', 403)
      res.statusCode = 200; res.setHeader('Content-Type', 'text/plain; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(params.get('hub.challenge') || ''); return
    }
    if (req.method !== 'POST') throw new OrderError('Use GET or POST for the WhatsApp webhook.', 405)
    if (!config.whatsappAppSecret || !config.whatsappPhoneId || !/^[1-9]\d{9,14}$/.test(messenger.businessNumber)) throw new OrderError('WhatsApp webhooks are not configured.', 503)
    const raw = await rawBody(req)
    const signature = req.headers['x-hub-signature-256']
    if (typeof signature !== 'string' || !/^sha256=[a-f0-9]{64}$/i.test(signature) || !timingSafeEqual(createHmac('sha256', config.whatsappAppSecret).update(raw).digest(), Buffer.from(signature.slice(7), 'hex'))) throw new OrderError('The WhatsApp event signature is invalid.', 400)
    const body = parseBody(raw)
    if (body.object !== 'whatsapp_business_account') return json(res, 200, { received: true })
    await store.transact(async (db, persist) => {
      const ranks = { accepted: 0, sent: 1, delivered: 2, read: 3 }
      for (const entry of Array.isArray(body.entry) ? body.entry : []) for (const change of Array.isArray(entry.changes) ? entry.changes : []) {
        if (change.field !== 'messages' || change.value?.metadata?.phone_number_id !== config.whatsappPhoneId || String(change.value?.metadata?.display_phone_number || '').replace(/\D/g, '') !== messenger.businessNumber) continue
        // Only the server's signature-verified Meta payload can open a reply
        // window. An on-page click, a checkout phone or a receipt cannot do so.
        for (const message of Array.isArray(change.value.messages) ? change.value.messages : []) {
          if (message.type !== 'text' || typeof message.text?.body !== 'string' || message.text.body.length > 4096 || !/^wamid\.[A-Za-z0-9+/=_-]{1,512}$/.test(message.id || '') || !/^[1-9]\d{9,14}$/.test(message.from || '') || message.from === messenger.businessNumber || !/^\d{1,12}$/.test(String(message.timestamp || ''))) continue
          const timestamp = Number(message.timestamp) * 1000
          const current = monotonic()
          if (!Number.isSafeInteger(timestamp) || timestamp <= current - CUSTOMER_SERVICE_WINDOW_MS || timestamp > current + 60000) continue
          const receivedAt = Math.min(timestamp, current)
          const inbound = Array.isArray(db.whatsappInboundEvents) ? db.whatsappInboundEvents : []
          if (inbound.some(event => event.id === message.id)) continue
          db.whatsappInboundEvents = [...inbound.filter(event => event.timestamp > current - CUSTOMER_SERVICE_WINDOW_MS - 3600000).slice(-9999), { id: message.id, timestamp: receivedAt }]
          const references = [...message.text.body.matchAll(/(?<![A-Za-z0-9-])BH-([a-f0-9]{32})(?![A-Za-z0-9-])/gi)].map(match => `BH-${match[1].toLowerCase()}`)
          const distinctReferences = [...new Set(references)]
          const referenced = distinctReferences.length === 1
            ? db.orders.find(order => order.reference === distinctReferences[0] && order.customerPhone === message.from && order.whatsappConsent === true && receivedAt >= Math.floor(Date.parse(order.createdAt) / 1000) * 1000)
            : undefined
          for (const order of db.orders) {
            if (order.customerPhone !== message.from || order.whatsappConsent !== true || (order !== referenced && order.whatsappConversation?.customerPhone !== message.from) || receivedAt < Math.floor(Date.parse(order.createdAt) / 1000) * 1000) continue
            const previousTime = Date.parse(order.whatsappConversation?.lastCustomerMessageAt)
            if (Number.isFinite(previousTime) && previousTime >= receivedAt) continue
            order.whatsappConversation = { customerPhone: message.from, businessPhoneNumberId: config.whatsappPhoneId, lastCustomerMessageAt: new Date(receivedAt).toISOString(), expiresAt: new Date(receivedAt + CUSTOMER_SERVICE_WINDOW_MS).toISOString() }
          }
          // Persist dedupe and conversation before attempting delivery. Retried
          // webhooks cannot turn an uncertain send into a duplicate payment link.
          await persist()
          if (referenced?.paymentUrl) {
            if (referenced.status === 'awaiting_payment') await sendMessage(referenced, 'payment', persist)
            else if (referenced.status === 'confirmed' && referenced.paymentStatus === 'paid') await sendMessage(referenced, 'confirmation', persist)
          }
        }
        for (const status of Array.isArray(change.value.statuses) ? change.value.statuses : []) {
          if (!['sent', 'delivered', 'read', 'failed'].includes(status.status) || typeof status.id !== 'string') continue
          const eventId = `wa:${status.id}:${status.status}:${String(status.timestamp || '')}`
          if (db.webhookEvents.includes(eventId)) continue
          let matched = false
          for (const order of db.orders) for (const key of ['messageDelivery', 'confirmationDelivery']) {
            const delivery = order[key]
            if (delivery?.messageId !== status.id || String(status.recipient_id || '').replace(/\D/g, '') !== order.customerPhone) continue
            matched = true
            if ((ranks[delivery.status] || 0) > (ranks[status.status] ?? -1) && !(status.status === 'failed' && (ranks[delivery.status] || 0) < 2)) continue
            order[key] = { ...delivery, status: status.status, updatedAt: dateNow().toISOString(), ...(status.status === 'failed' ? { error: 'WhatsApp could not deliver this message. Check the number and retry.', retryable: false } : { error: undefined }) }
          }
          if (matched) db.webhookEvents = [...db.webhookEvents.slice(-999), eventId]
        }
      }
      await persist()
    })
    return json(res, 200, { received: true })
  }

  async function provider(path, init = {}) {
    let response
    try { response = await fetchImpl(`https://api.razorpay.com/v1/${path}`, { ...init, headers: { Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64')}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000) }) }
    catch { throw new OrderError('Razorpay Test Mode could not be reached. Please try again.', 502) }
    if (!response.ok) throw new OrderError('Razorpay Test Mode could not complete this request. Check the test account setup and try again.', 502)
    try { return await response.json() } catch { throw new OrderError('Razorpay Test Mode returned an unreadable response.', 502) }
  }

  function validateLink(link, order) {
    if (!/^plink_[A-Za-z0-9]+$/.test(link?.id || '') || link.reference_id !== order.reference || link.amount !== order.amount || link.currency !== 'INR' || !isPaymentLinkUrl(link.short_url)) throw new OrderError('The test payment link does not match this order.', 502)
    if (order.providerLinkId && link.id !== order.providerLinkId) throw new OrderError('The test payment link does not match this order.', 502)
  }

  async function makeLink(order, recovering) {
    if (recovering) {
      const result = await provider(`payment_links?reference_id=${encodeURIComponent(order.reference)}`)
      if (!Array.isArray(result.payment_links)) throw new OrderError('The earlier test payment request could not be checked. Please try again.', 502)
      const matching = result.payment_links.filter(link => link.reference_id === order.reference)
      if (matching.length > 1) throw new OrderError('This payment reference needs review before retrying.', 409)
      if (matching.length) { validateLink(matching[0], order); return matching[0] }
    }
    const link = await provider('payment_links', { method: 'POST', body: JSON.stringify({ amount: order.amount, currency: 'INR', accept_partial: false, reference_id: order.reference, description: `Baker’s House test order ${order.reference} — no real payment`, customer: { name: order.request.fields.name, contact: `+${order.customerPhone}` }, notify: { sms: false, email: false }, reminder_enable: false, expire_by: Math.floor(monotonic() / 1000) + 24 * 60 * 60, notes: { purpose: 'Test order only', local_order_id: order.id } }) })
    validateLink(link, order)
    return link
  }

  async function reconcile(order, persist, force = false) {
    if (!order.providerLinkId) return
    if (order.status === 'confirmed') { await sendMessage(order, 'confirmation', persist); return }
    if (!force && order.lastCheckedAt && monotonic() - order.lastCheckedAt < pollIntervalMs) return
    const link = await provider(`payment_links/${order.providerLinkId}`)
    validateLink(link, order)
    order.lastCheckedAt = monotonic()
    if (link.status === 'paid') {
      if (link.amount_paid !== order.amount || link.accept_partial === true) throw new OrderError('The full test payment amount has not been verified.', 409)
      const records = Array.isArray(link.payments) ? link.payments : []
      const record = records.find(payment => /^pay_[A-Za-z0-9]+$/.test(payment.payment_id || '') && payment.plink_id === order.providerLinkId && payment.status === 'captured' && payment.amount === order.amount)
      if (!record) throw new OrderError('The test payment is not captured yet. Please check again shortly.', 409)
      const payment = await provider(`payments/${record.payment_id}`)
      if (payment.id !== record.payment_id || payment.status !== 'captured' || payment.captured !== true || payment.amount !== order.amount || payment.currency !== 'INR') throw new OrderError('The test payment details could not be verified for this order.', 409)
      order.status = 'confirmed'; order.paymentStatus = 'paid'; order.paymentId = payment.id; order.confirmedAt = dateNow().toISOString()
    } else if (link.status === 'expired' || link.status === 'cancelled') {
      order.status = link.status; order.paymentStatus = 'unpaid'
    } else {
      order.status = 'awaiting_payment'; order.paymentStatus = link.status === 'partially_paid' ? 'pending' : 'unpaid'
    }
    await persist()
    if (order.status === 'confirmed') await sendMessage(order, 'confirmation', persist)
  }

  const middleware = async function testOrderMiddleware(req, res, next) {
    const path = req.url?.split('?')[0]
    if (path !== ROOT && !path?.startsWith(`${ROOT}/`)) return next()
    try {
      const webhook = path === `${ROOT}/webhook` || path === `${ROOT}/whatsapp/webhook`
      if (!webhook && !originAllowed(req, hosts)) throw new OrderError('Order requests must come from this website.', 403)
      if (path === `${ROOT}/whatsapp/webhook`) return await whatsappWebhook(req, res)
      if (path === `${ROOT}/config` && req.method === 'GET') return json(res, 200, { configured: config.configured, mode: 'test', whatsappConfigured: messenger.configured, messagingMode: 'customer_initiated', whatsappNumber })
      if (!config.configured) throw new OrderError('Razorpay Test Mode is not configured. No order has been confirmed.', 503)
      if (webhook) {
        if (req.method !== 'POST') throw new OrderError('Use POST for payment events.', 405)
        if (!config.webhookSecret) throw new OrderError('Test payment webhooks are not configured.', 503)
        const raw = await rawBody(req)
        const signature = req.headers['x-razorpay-signature']
        if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature) || !timingSafeEqual(createHmac('sha256', config.webhookSecret).update(raw).digest(), Buffer.from(signature, 'hex'))) throw new OrderError('The payment event signature is invalid.', 400)
        const body = parseBody(raw)
        const eventId = typeof req.headers['x-razorpay-event-id'] === 'string' ? req.headers['x-razorpay-event-id'].slice(0, 200) : hash(raw)
        const linkId = body.payload?.payment_link?.entity?.id
        const outcome = await store.transact(async (db, persist) => {
          if (db.webhookEvents.includes(eventId)) return { received: true, duplicate: true }
          if (['payment_link.paid', 'payment_link.partially_paid', 'payment_link.expired', 'payment_link.cancelled'].includes(body.event)) {
            const order = db.orders.find(entry => entry.providerLinkId === linkId)
            if (order) await reconcile(order, persist, true)
          }
          db.webhookEvents = [...db.webhookEvents.slice(-999), eventId]
          await persist()
          return { received: true }
        })
        return json(res, 200, outcome)
      }
      if (path === ROOT && req.method === 'POST') {
        const identity = req.socket.remoteAddress || 'local'
        const bucket = requestBuckets.get(identity)
        if (bucket && monotonic() - bucket.start < 60000 && bucket.count >= 30) throw new OrderError('Too many test checkouts. Please wait a minute.', 429)
        requestBuckets.set(identity, bucket && monotonic() - bucket.start < 60000 ? { ...bucket, count: bucket.count + 1 } : { start: monotonic(), count: 1 })
        if (requestBuckets.size > 1000) for (const [key, value] of requestBuckets) if (monotonic() - value.start >= 60000) requestBuckets.delete(key)
        if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) throw new OrderError('Send a JSON order request.', 415)
        const body = parseBody(await rawBody(req))
        if (typeof body.idempotencyKey !== 'string' || !/^[A-Za-z0-9_-]{16,128}$/.test(body.idempotencyKey)) throw new OrderError('Refresh checkout and try again with a valid request reference.')
        if (body.paymentMethod !== 'payment-link') throw new OrderError('Choose the Razorpay test payment link.')
        const customerPhone = normalizeCustomerPhone(body.fields?.phone)
        if (customerPhone === whatsappNumber) throw new OrderError('Use the customer’s WhatsApp number. The bakery sender number cannot receive its own checkout reply.')
        let request
        try { request = buildOrderRequest({ ...body, fields: { ...body.fields, phone: `+${customerPhone}` }, now: dateNow() }) }
        catch (error) { throw new OrderError(error.message || 'Review your order details and try again.') }
        if (request.totals.needsPriceConfirmation) throw new OrderError('Every item needs a confirmed price before test payment. Remove unpriced selections.')
        const amount = Math.round(request.totals.total * 100)
        if (!Number.isSafeInteger(amount) || amount < 100 || amount > 50000000) throw new OrderError('The test payment amount must be between ₹1 and ₹5,00,000.')
        const whatsappConsent = body.whatsappConsent === true
        const payloadHash = hash(JSON.stringify({ fingerprint: request.fingerprint, whatsappConsent }))
        const keyHash = hash(body.idempotencyKey)
        const outcome = await store.transact(async (db, persist) => {
          let order = db.orders.find(entry => entry.idempotencyHash === keyHash)
          if (order && order.payloadHash !== payloadHash) throw new OrderError('This checkout reference belongs to different details. Start a new checkout.', 409)
          if (order?.paymentUrl) { await sendMessage(order, 'payment', persist); return { order: publicOrder(order, true) } }
          const recovering = Boolean(order)
          if (!order) {
            db.orders = db.orders.filter(entry => monotonic() - Date.parse(entry.createdAt) < 7 * 86400000)
            if (db.orders.length >= 2000) throw new OrderError('The local test order store is full.', 429)
            const id = randomUUID()
            order = { id, accessToken: randomBytes(32).toString('hex'), reference: `BH-${randomUUID().replaceAll('-', '')}`, idempotencyHash: keyHash, payloadHash, request, customerPhone, whatsappConsent, amount, currency: 'INR', status: 'awaiting_payment', paymentStatus: 'unpaid', createdAt: dateNow().toISOString(), paymentUrl: null, providerLinkId: null }
            db.orders.push(order)
            await persist()
          }
          try {
            const link = await makeLink(order, recovering)
            order.providerLinkId = link.id; order.paymentUrl = link.short_url
            await persist()
            await sendMessage(order, 'payment', persist)
            return { order: publicOrder(order, true) }
          } catch (error) {
            // Keep the allocated reference so retries can reconcile an uncertain provider response.
            await persist()
            return { error }
          }
        })
        if (outcome.error) throw outcome.error
        return json(res, 200, outcome.order)
      }
      const resendMatch = new RegExp(`^${ROOT}/([a-f0-9-]{36})/send-payment-link$`).exec(path)
      if (resendMatch && req.method === 'POST') {
        const token = req.headers.authorization?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1]
        const outcome = await store.transact(async (db, persist) => {
          const order = db.orders.find(entry => entry.id === resendMatch[1])
          if (!order || !tokenMatches(token, order.accessToken)) throw new OrderError('This test order could not be accessed.', 404)
          if (!order.whatsappConsent) throw new OrderError('Customer consent is required to send WhatsApp messages.', 400)
          if (order.status !== 'awaiting_payment') throw new OrderError('This order no longer needs a payment message.', 409)
          if (!messenger.configured) throw new OrderError('The bakery’s WhatsApp Business connection is not configured.', 503)
          await sendMessage(order, 'payment', persist, true)
          return publicOrder(order)
        })
        return json(res, 200, outcome)
      }
      const match = new RegExp(`^${ROOT}/([a-f0-9-]{36})$`).exec(path)
      if (match && req.method === 'GET') {
        const token = req.headers.authorization?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1]
        const outcome = await store.transact(async (db, persist) => {
          const order = db.orders.find(entry => entry.id === match[1])
          if (!order || !tokenMatches(token, order.accessToken)) throw new OrderError('This test order could not be accessed.', 404)
          await reconcile(order, persist)
          if (order.status === 'awaiting_payment') await sendMessage(order, 'payment', persist)
          return publicOrder(order)
        })
        return json(res, 200, outcome)
      }
      throw new OrderError('Test order route not found.', 404)
    } catch (error) {
      if (!res.writableEnded) json(res, error instanceof OrderError ? error.status : 500, { error: error instanceof OrderError ? error.message : 'The test order could not be completed. Please try again.' })
    }
  }
  middleware.reconcilePending = async () => {
    if (!config.configured) return
    await store.transact(async (db, persist) => {
      const pending = db.orders.filter(order => order.providerLinkId && (order.status === 'awaiting_payment' || order.status === 'confirmed' && order.whatsappConsent && messenger.confirmationConfigured && messenger.windowState(order, order.customerPhone) === 'active' && !['accepted', 'sent', 'delivered', 'read', 'unknown'].includes(order.confirmationDelivery?.status))).sort((a, b) => (a.lastCheckedAt || 0) - (b.lastCheckedAt || 0)).slice(0, 5)
      for (const order of pending) {
        try { await reconcile(order, persist); if (order.status === 'awaiting_payment') await sendMessage(order, 'payment', persist) }
        catch { /* Provider errors never confirm an order; a later check retries. */ }
      }
    })
  }
  return middleware
}

export function testPaymentApiPlugin(env) {
  const middleware = createTestOrderMiddleware({ env })
  let timer
  const attach = server => {
    server.middlewares.use(middleware)
    clearInterval(timer)
    timer = setInterval(() => middleware.reconcilePending().catch(() => {}), 15000)
    timer.unref?.()
    server.httpServer?.once('close', () => clearInterval(timer))
  }
  return { name: 'bakers-house-test-order-payments', configureServer: attach, configurePreviewServer: attach, closeBundle() { clearInterval(timer) } }
}
