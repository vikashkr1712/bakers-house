// Server-only Meta Cloud API replies. This integration deliberately sends only
// free-form service replies inside a signature-verified customer message window.
// There is no template fallback and checkout alone never opens this window.

const PAYMENT_CONFIGURATION = [
  'WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_GRAPH_VERSION', 'WHATSAPP_APP_SECRET',
  'WHATSAPP_WEBHOOK_VERIFY_TOKEN', 'WHATSAPP_BUSINESS_NUMBER',
]
export const CUSTOMER_SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000
const cleanText = (value, max) => {
  const text = String(value ?? '').replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

export class WhatsAppMessageError extends Error {
  constructor(message, code, { retryable = false, definitive = true, responseStatus } = {}) {
    super(message)
    this.name = 'WhatsAppMessageError'
    this.code = code
    this.retryable = retryable
    this.definitive = definitive
    if (Number.isInteger(responseStatus)) this.responseStatus = responseStatus
  }
}

function invalidOrder() {
  return new WhatsAppMessageError('The test order is not valid for WhatsApp messaging.', 'invalid_order')
}

function recipientPhone(value) {
  const input = String(value ?? '').trim()
  if (!/^\+?[\d\s().-]+$/.test(input)) throw invalidOrder()
  let digits = input.replace(/\D/g, '')
  if (digits.length === 10) digits = `91${digits}`
  if (!/^[1-9]\d{9,14}$/.test(digits)) throw invalidOrder()
  return digits
}

function paymentUrl(value) {
  if (typeof value !== 'string' || value.length > 180 || /[\s\\\u0000-\u001f\u007f]/.test(value)) throw invalidOrder()
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !['rzp.io', 'rzp.in'].includes(url.hostname) || url.username || url.password || url.port || url.pathname.length < 2 || url.hash) throw new Error()
    return value
  } catch { throw invalidOrder() }
}

function configFrom(env) {
  const values = Object.fromEntries(PAYMENT_CONFIGURATION.map(name => [name, String(env[name] || '').trim()]))
  const businessNumber = values.WHATSAPP_BUSINESS_NUMBER.replace(/\D/g, '')
  const valid = {
    WHATSAPP_ACCESS_TOKEN: values.WHATSAPP_ACCESS_TOKEN.length > 0 && values.WHATSAPP_ACCESS_TOKEN.length <= 4096 && !/\s/.test(values.WHATSAPP_ACCESS_TOKEN),
    WHATSAPP_PHONE_NUMBER_ID: /^\d{5,30}$/.test(values.WHATSAPP_PHONE_NUMBER_ID),
    WHATSAPP_GRAPH_VERSION: /^v[1-9]\d{0,2}\.\d{1,2}$/.test(values.WHATSAPP_GRAPH_VERSION),
    WHATSAPP_APP_SECRET: values.WHATSAPP_APP_SECRET.length > 0 && values.WHATSAPP_APP_SECRET.length <= 4096,
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: values.WHATSAPP_WEBHOOK_VERIFY_TOKEN.length > 0 && values.WHATSAPP_WEBHOOK_VERIFY_TOKEN.length <= 512,
    WHATSAPP_BUSINESS_NUMBER: /^\+?[\d\s().-]+$/.test(values.WHATSAPP_BUSINESS_NUMBER) && /^[1-9]\d{9,14}$/.test(businessNumber),
  }
  const missingConfiguration = PAYMENT_CONFIGURATION.filter(name => !valid[name])
  return {
    token: values.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: values.WHATSAPP_PHONE_NUMBER_ID,
    version: values.WHATSAPP_GRAPH_VERSION,
    businessNumber: valid.WHATSAPP_BUSINESS_NUMBER ? businessNumber : '',
    configured: missingConfiguration.length === 0,
    confirmationConfigured: missingConfiguration.length === 0,
    missingConfiguration,
  }
}

export function buildWhatsAppOrderSummary(order) {
  const request = order.request
  if (!request || !Array.isArray(request.items) || !request.items.length || !request.fields || !['delivery', 'pickup'].includes(request.fulfilment)) throw invalidOrder()
  const itemText = request.items.map(item => {
    const options = [item.weight, item.flavour, item.eggPreference && (item.eggPreference === 'with-egg' ? 'with egg' : 'eggless')].filter(Boolean)
    const details = [
      `${cleanText(item.name, 60)} × ${item.quantity}`,
      ...options.map(value => cleanText(value, 30)),
      item.cakeMessage && `cake message: ${cleanText(item.cakeMessage, 80)}`,
      item.hamperContents?.length && `includes ${item.hamperContents.map(content => `${cleanText(content.name, 35)} × ${content.quantity}`).join(', ')}`,
      item.packaging && `packaging: ${cleanText(item.packaging, 30)}`,
      item.hamper?.giftMessage && `gift note: ${cleanText(item.hamper.giftMessage, 60)}`,
    ].filter(Boolean)
    return details.join(' / ')
  }).join('; ')
  const destination = request.fulfilment === 'delivery'
    ? `Delivery: ${[request.fields.address, request.fields.city, request.fields.pincode, request.fields.landmark].filter(Boolean).join(', ')}`
    : `Pickup: ${request.store?.name || 'bakery'}${request.store?.address ? `, ${request.store.address}` : ''}`
  const slot = `${cleanText(request.requestedDate, 10)} ${cleanText(request.slotLabel || request.slotId, 50)}`
  // Keep long baskets readable and below Meta's text-message limit. An ellipsis
  // makes any condensed portion visible; the saved order retains every detail.
  return cleanText([
    'TEST ONLY', cleanText(itemText, 230),
    cleanText(`${destination}; ${slot}`, 160),
    request.fields.message && `Notes: ${cleanText(request.fields.message, 35)}`,
  ].filter(Boolean).join(' | '), 450)
}

function validateOrder(order) {
  if (!order || order.mode !== 'test' || !/^[A-Za-z0-9-]{3,80}$/.test(order.reference || '') || !Number.isSafeInteger(order.amount) || order.amount <= 0 || order.amount > 10000000000 || order.currency !== 'INR') throw invalidOrder()
  if (order.whatsappConsent !== true) throw new WhatsAppMessageError('Customer consent is required before sending WhatsApp order messages.', 'consent_required')
  const recipient = recipientPhone(order.customerPhone)
  const name = cleanText(order.request?.fields?.name, 60)
  if (!name) throw invalidOrder()
  const total = `INR ${(order.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (test only)`
  return { recipient, name, total }
}

/** No retries here: the order outbox must decide whether a failed attempt is safe. */
export function createWhatsAppMessenger({ env = process.env, fetchImpl = globalThis.fetch, now = Date.now } = {}) {
  const config = configFrom(env)

  function windowState(order, recipient) {
    const conversation = order.whatsappConversation
    if (!conversation || conversation.customerPhone !== recipient || conversation.businessPhoneNumberId !== config.phoneNumberId) return 'awaiting_customer_message'
    const received = Date.parse(conversation.lastCustomerMessageAt)
    const expires = Date.parse(conversation.expiresAt)
    const current = Number(now())
    if (!Number.isFinite(received) || !Number.isFinite(expires) || received > current || expires !== received + CUSTOMER_SERVICE_WINDOW_MS) return 'awaiting_customer_message'
    return current < expires ? 'active' : 'window_expired'
  }

  async function send(order, details, body) {
    // Recheck immediately before the external request; callers cannot override
    // the service window by passing their own status or an arbitrary expiry.
    const state = windowState(order, details.recipient)
    if (state !== 'active') return { status: state, recipient: details.recipient }
    let response
    try {
      response = await fetchImpl(`https://graph.facebook.com/${config.version}/${config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
        redirect: 'error',
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          messaging_product: 'whatsapp', recipient_type: 'individual', to: details.recipient,
          type: 'text', text: { preview_url: false, body },
        }),
      })
    } catch {
      // The provider may have accepted the request before the connection failed.
      // Never turn an ambiguous outcome into an automatic duplicate message.
      throw new WhatsAppMessageError('WhatsApp acceptance could not be confirmed. Check message delivery before retrying.', 'delivery_unknown', { definitive: false })
    }
    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500
      throw new WhatsAppMessageError(
        retryable ? 'WhatsApp temporarily rejected the message. A later retry is available.' : 'WhatsApp rejected the reply. Check the business account, recipient and customer-service window.',
        retryable ? 'provider_unavailable' : 'provider_rejected',
        { retryable, responseStatus: response.status },
      )
    }
    let responseBody
    try { responseBody = await response.json() } catch {
      throw new WhatsAppMessageError('WhatsApp acceptance could not be confirmed. Check message delivery before retrying.', 'delivery_unknown', { definitive: false })
    }
    const messageId = responseBody?.messages?.[0]?.id
    const contacts = responseBody?.contacts
    if (!/^wamid\.[A-Za-z0-9+/=_-]{1,512}$/.test(messageId || '') || (responseBody.messaging_product && responseBody.messaging_product !== 'whatsapp') || (contacts !== undefined && (!Array.isArray(contacts) || !contacts.some(contact => contact.wa_id === details.recipient)))) {
      throw new WhatsAppMessageError('WhatsApp acceptance could not be matched to this customer. Check message delivery before retrying.', 'delivery_unknown', { definitive: false })
    }
    return { status: 'accepted', recipient: details.recipient, messageId, acceptedAt: new Date(Number(now())).toISOString() }
  }

  return {
    configured: config.configured,
    confirmationConfigured: config.confirmationConfigured,
    configurationStatus: config.configured ? 'ready' : `Missing or invalid: ${config.missingConfiguration.join(', ')}`,
    missingConfiguration: [...config.missingConfiguration],
    businessNumber: config.businessNumber,
    windowState,
    async sendPaymentLink(order) {
      const details = validateOrder(order)
      if (details.recipient === config.businessNumber) throw invalidOrder()
      const url = paymentUrl(order.paymentUrl)
      const summary = buildWhatsAppOrderSummary(order)
      if (!config.configured) return { status: 'not_configured', recipient: details.recipient }
      return send(order, details, [
        `Hello ${details.name}, here is your Baker’s House test order ${order.reference}.`,
        summary,
        `Total: ${details.total}`,
        `Pay using Razorpay Test Mode: ${url}`,
        'This is a demo. No real money or bakery fulfilment. Your test order is confirmed only after the test payment is verified.',
      ].join('\n\n'))
    },
    async sendConfirmation(order) {
      const details = validateOrder(order)
      if (details.recipient === config.businessNumber) throw invalidOrder()
      if (!config.confirmationConfigured) return { status: 'not_configured', recipient: details.recipient }
      if (order.status !== 'confirmed' || order.paymentStatus !== 'paid' || !/^pay_[A-Za-z0-9]+$/.test(order.paymentId || '')) throw new WhatsAppMessageError('A verified test payment is required before sending an order confirmation.', 'payment_not_verified')
      return send(order, details, `Hello ${details.name}, your Baker’s House test order ${order.reference} is confirmed.\n\nVerified test payment: ${details.total}.\n\nDemo only — no real payment or bakery fulfilment.`)
    },
  }
}
