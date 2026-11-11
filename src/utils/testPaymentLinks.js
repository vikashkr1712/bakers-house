export const PAYMENT_SESSION_KEY = 'bakers-house-checkout-order-v2'
const REQUEST_TIMEOUT = 20_000
const MAX_ATTEMPT_AGE = 24 * 60 * 60 * 1000
let memoryAttempt = null

const clean = (value, max) => String(value ?? '').trim().slice(0, max)
export function normalizeCustomerPhone(value) {
  const digits = String(value || '').replace(/\D/g, '').replace(/^00/, '')
  return digits.length === 10 ? `91${digits}` : digits
}

export function serializeTestCheckout(checkout) {
  const fields = checkout?.fields || {}
  return {
    items: (Array.isArray(checkout?.items) ? checkout.items : []).map((item) => ({
      id: item.id, quantity: item.quantity, weight: item.weight || '', flavour: item.flavour || '',
      ...(item.eggPreference ? { eggPreference: item.eggPreference } : {}),
      ...(item.cakeMessage ? { cakeMessage: clean(item.cakeMessage, 80) } : {}),
      ...(item.hamper ? { hamper: {
        name: item.hamper.name, packagingId: item.hamper.packagingId, giftMessage: item.hamper.giftMessage || '',
        items: (item.hamper.items || []).map(({ id, weight, flavour, quantity }) => ({ id, weight, flavour, quantity })),
      } } : {}),
    })),
    fields: {
      name: clean(fields.name, 120), phone: normalizeCustomerPhone(fields.phone), message: clean(fields.message, 1500),
      ...(checkout?.fulfilment === 'delivery' ? { address: clean(fields.address, 300), city: clean(fields.city, 80), pincode: clean(fields.pincode, 6), landmark: clean(fields.landmark, 150) } : {}),
    },
    fulfilment: checkout?.fulfilment, storeId: checkout?.storeId || '', requestedDate: checkout?.requestedDate || '',
    slotId: checkout?.slotId || '', couponCode: clean(checkout?.couponCode, 30).toUpperCase(), paymentMethod: checkout?.paymentMethod || 'payment-link',
  }
}

export const checkoutFingerprint = (checkout) => JSON.stringify(serializeTestCheckout(checkout))

// Only a freshly verified server response can provide the final order message.
// Opening this link still requires the customer to tap Send in WhatsApp.
export function customerWhatsAppChat(order) {
  if (!isOrderHandoffReady(order)) return null
  try {
    const verified = validateTestOrder(order)
    return { number: verified.whatsappNumber, text: verified.orderSummary, url: verified.whatsappUrl }
  } catch { return null }
}

export function safePaymentUrl(value) {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    if (url.protocol !== 'https:' || url.username || url.password || url.port || !['rzp.io', 'rzp.in', 'razorpay.com'].includes(host) && !host.endsWith('.razorpay.com')) return ''
    return url.href
  } catch { return '' }
}

export function validateTestOrder(value, { expected, requireToken = false, customerPhone } = {}) {
  const validId = typeof value?.id === 'string' && /^[A-Za-z0-9_-]{6,100}$/.test(value.id)
  const validReference = typeof value?.reference === 'string' && value.reference.length >= 3 && value.reference.length <= 100
  if (!validId || !validReference || value.mode !== 'test' || value.currency !== 'INR' || !Number.isSafeInteger(value.amount) || value.amount <= 0 || !['payment-link', 'cod'].includes(value.paymentMethod)) throw new Error('The order could not be verified. Please try again.')
  if (!['awaiting_payment', 'awaiting_bakery_confirmation', 'expired', 'cancelled'].includes(value.status) || !['unpaid', 'pending', 'paid', 'failed'].includes(value.paymentStatus)) throw new Error('The order status could not be verified. Please check again.')
  if (value.paymentMethod === 'payment-link' && !safePaymentUrl(value.paymentUrl) || value.paymentMethod === 'cod' && (value.paymentUrl != null || value.paymentStatus !== 'unpaid')) throw new Error('The payment details could not be verified.')
  const handoffReady = value.status === 'awaiting_bakery_confirmation' && (value.paymentMethod === 'cod' || value.paymentStatus === 'paid' && /^pay_[A-Za-z0-9]+$/.test(value.paymentId || ''))
  if (value.handoffReady !== handoffReady || value.status === 'awaiting_bakery_confirmation' && !handoffReady || value.paymentStatus === 'paid' && !handoffReady) throw new Error('The payment has not been fully verified. Please check again.')
  if (!/^[1-9]\d{9,14}$/.test(value.customerPhone || '') || customerPhone && value.customerPhone !== normalizeCustomerPhone(customerPhone)) throw new Error('The test payment link belongs to a different customer. Please review your details.')
  if (requireToken && (typeof value.accessToken !== 'string' || !/^[A-Za-z0-9_-]{24,256}$/.test(value.accessToken))) throw new Error('The test order could not be accessed securely. Please try again.')
  if (expected && ['id', 'reference', 'amount', 'currency', 'customerPhone', 'paymentMethod', 'paymentUrl'].some((key) => value[key] !== expected[key])) throw new Error('The payment details do not match this order. No payment has been accepted.')
  if (!/^[1-9]\d{9,14}$/.test(value.whatsappNumber || '') || value.messagingMode !== 'customer_to_bakery') throw new Error('The bakery WhatsApp number could not be verified.')
  if (handoffReady) {
    try {
      const url = new URL(value.whatsappUrl)
      if (typeof value.orderSummary !== 'string' || value.orderSummary.length < 20 || value.orderSummary.length > 100000 || !value.orderSummary.includes(value.reference) || url.protocol !== 'https:' || url.hostname !== 'wa.me' || url.username || url.password || url.port || url.hash || url.pathname !== `/${value.whatsappNumber}` || url.searchParams.get('text') !== value.orderSummary || [...url.searchParams].length !== 1) throw new Error()
    } catch { throw new Error('The WhatsApp order summary could not be verified. Please check again.') }
  } else if (value.whatsappUrl != null || value.orderSummary != null) throw new Error('WhatsApp is available only after a saved cash order or verified payment.')
  return { ...value, paymentUrl: value.paymentMethod === 'cod' ? null : safePaymentUrl(value.paymentUrl) }
}

function persistAttempt(attempt, storage) {
  memoryAttempt = attempt
  try { (storage ?? globalThis.sessionStorage).setItem(PAYMENT_SESSION_KEY, JSON.stringify(attempt)) } catch { /* The mounted checkout can continue in memory when storage is unavailable. */ }
  return attempt
}

export function readStoredPaymentAttempt(storage) {
  let attempt
  try {
    const stored = (storage ?? globalThis.sessionStorage).getItem(PAYMENT_SESSION_KEY)
    attempt = stored ? JSON.parse(stored) : storage ? null : memoryAttempt
  } catch { attempt = memoryAttempt }
  if (!attempt || typeof attempt.checkoutFingerprint !== 'string' || typeof attempt.idempotencyKey !== 'string' || !/^[A-Za-z0-9_-]{16,100}$/.test(attempt.idempotencyKey) || !Number.isFinite(attempt.startedAt) || Date.now() - attempt.startedAt < 0 || Date.now() - attempt.startedAt > MAX_ATTEMPT_AGE) return null
  if (attempt.order) {
    try { validateTestOrder(attempt.order, { requireToken: true }) }
    catch { return null }
  }
  return attempt
}

export function paymentAttemptFor(checkout, { storage, fresh = false } = {}) {
  const fingerprint = checkoutFingerprint(checkout)
  const previous = readStoredPaymentAttempt(storage)
  if (!fresh && previous?.checkoutFingerprint === fingerprint) return previous
  return persistAttempt({ checkoutFingerprint: fingerprint, checkout: serializeTestCheckout(checkout), idempotencyKey: globalThis.crypto.randomUUID(), startedAt: Date.now() }, storage)
}

export function rememberTestOrder(attempt, order, storage) {
  const verified = validateTestOrder(order, { requireToken: true })
  const previous = readStoredPaymentAttempt(storage)
  return persistAttempt({ ...attempt, ...(previous?.idempotencyKey === attempt.idempotencyKey && previous.handoffOpenedFor ? { handoffOpenedFor: previous.handoffOpenedFor } : {}), order: verified }, storage)
}

export function markWhatsAppHandoff(attempt, order, storage) {
  if (!isOrderHandoffReady(order)) return false
  const previous = readStoredPaymentAttempt(storage)
  if (previous?.idempotencyKey === attempt.idempotencyKey && previous.handoffOpenedFor === order.id) return false
  persistAttempt({ ...(previous?.idempotencyKey === attempt.idempotencyKey ? previous : attempt), handoffOpenedFor: order.id }, storage)
  return true
}

export function forgetTestOrder(storage) {
  memoryAttempt = null
  try {
    const target = storage ?? globalThis.sessionStorage
    target.removeItem(PAYMENT_SESSION_KEY)
    target.removeItem('bakers-house-test-payment-v1')
  } catch { /* No saved session can be removed if storage is unavailable. */ }
}

async function request(path, { body, token, signal, fetchImpl = globalThis.fetch } = {}) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  if (signal?.aborted) controller.abort()
  else signal?.addEventListener('abort', abort, { once: true })
  const timeout = setTimeout(abort, REQUEST_TIMEOUT)
  try {
    const response = await fetchImpl(path, {
      method: body ? 'POST' : 'GET', cache: 'no-store', credentials: 'same-origin', signal: controller.signal,
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok || !data) {
      const error = new Error(typeof data?.error === 'string' ? data.error : 'Test payments are unavailable right now. Please try again.')
      error.status = response.status
      throw error
    }
    return data
  } catch (error) {
    if (signal?.aborted) { const cancelled = new Error('The test payment check was cancelled.'); cancelled.name = 'AbortError'; throw cancelled }
    if (error.name === 'AbortError') throw new Error('The test payment request timed out. Please try again.')
    if (error instanceof TypeError) throw new Error('Could not connect to the test payment service. Please try again.')
    throw error
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}

export async function getTestPaymentConfig(options) {
  const config = await request('/api/orders/config', options)
  if (config.mode !== 'test') throw new Error('Only Razorpay Test Mode is supported by this checkout.')
  if (config.messagingMode !== 'customer_to_bakery') throw new Error('WhatsApp checkout is not available right now.')
  if (config.whatsappNumber !== undefined && !/^[1-9]\d{9,14}$/.test(config.whatsappNumber)) throw new Error('The bakery WhatsApp number could not be verified.')
  return { mode: 'test', configured: config.configured === true, codEnabled: config.codEnabled === true, payAtPickup: config.payAtPickup === true, whatsappNumber: config.whatsappNumber, messagingMode: 'customer_to_bakery' }
}

export async function createTestPaymentOrder(checkout, attempt, options) {
  const params = new URLSearchParams()
  const current = new URLSearchParams(globalThis.location?.search || '')
  for (const key of ['item', 'quantity']) if (current.has(key)) params.set(key, current.get(key))
  const returnPath = `/checkout${params.size ? `?${params}` : ''}`
  const data = await request('/api/orders', { ...options, body: { ...serializeTestCheckout(checkout), idempotencyKey: attempt.idempotencyKey, returnPath } })
  return validateTestOrder(data, { requireToken: true, customerPhone: checkout.fields?.phone })
}

export async function getTestPaymentOrder(order, options) {
  if (!order?.id || !order.accessToken) throw new Error('This test order cannot be accessed. Please create a new payment link.')
  const data = await request(`/api/orders/${encodeURIComponent(order.id)}`, { ...options, token: order.accessToken })
  return { ...validateTestOrder(data, { expected: order }), accessToken: order.accessToken }
}

export const isOrderHandoffReady = (order) => order?.mode === 'test' && order?.handoffReady === true && order?.status === 'awaiting_bakery_confirmation' && (order?.paymentMethod === 'cod' && order?.paymentStatus === 'unpaid' || order?.paymentMethod === 'payment-link' && order?.paymentStatus === 'paid')
