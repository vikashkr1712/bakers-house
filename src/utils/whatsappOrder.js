import { products } from '../data/products.js'
import { getUnitPrice } from '../data/catalog.js'
import { getHamperProduct, HAMPER_PRODUCT_ID } from './hamperBasket.js'
import { getCheckoutTotals } from './checkoutPricing.js'
import { ORDERING_CONFIG } from '../config/ordering.js'
import { getAvailableSlots, getServiceability, validateSchedule } from './fulfilment.js'

export const REQUESTS_STORAGE_KEY = 'bakers-house-whatsapp-requests-v1'
const singleLine = (value, max = 300) => String(value ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max)
export const formatOrderPrice = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)

export function paymentChoices(fulfilment, config = ORDERING_CONFIG) {
  return [
    ...(config.onlinePayment?.enabled ? [{ id: 'manual-online', label: 'Online payment via WhatsApp', description: 'Ask for payment details in WhatsApp, make the payment yourself, then send a screenshot in the same chat. The bakery verifies receipt.' }] : []),
    ...(fulfilment === 'delivery' && config.delivery?.cashOnDelivery ? [{ id: 'cod', label: 'Cash on delivery', description: 'Pay when your order arrives. Send your request on WhatsApp for bakery confirmation.' }] : []),
    ...(fulfilment === 'pickup' && config.payAtPickup ? [{ id: 'cod', label: 'Pay at pickup', description: 'Pay at the store when you collect. Send your request on WhatsApp for bakery confirmation.' }] : []),
  ]
}

export function checkoutQuote(items, fulfilment, couponCode, config = ORDERING_CONFIG) {
  const subtotal = items.reduce((sum, item) => {
    const price = getUnitPrice(item.product, item.weight)
    return sum + (Number.isFinite(price) ? price * item.quantity : 0)
  }, 0)
  const totals = getCheckoutTotals(subtotal, fulfilment, couponCode, config.delivery?.fee ?? 0)
  return { ...totals, needsPriceConfirmation: items.some((item) => !Number.isFinite(getUnitPrice(item.product, item.weight))) }
}

export function validateCheckout({ fields, fulfilment, storeId, requestedDate, slotId, paymentMethod, config = ORDERING_CONFIG, now = new Date() }) {
  const errors = {}
  if (typeof fields?.name !== 'string' || fields.name.trim().length < 2) errors.name = 'Enter your full name.'
  const phone = typeof fields?.phone === 'string' ? fields.phone.trim() : ''
  const digits = phone.replace(/\D/g, '')
  if (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 10 || digits.length > 15) errors.phone = 'Enter a WhatsApp number with 10 to 15 digits.'
  if (!['delivery', 'pickup'].includes(fulfilment)) errors.fulfilment = 'Choose delivery or pickup.'
  if (fulfilment === 'delivery') {
    if (typeof fields?.address !== 'string' || fields.address.trim().length < 8) errors.address = 'Enter a complete delivery address.'
    if (typeof fields?.city !== 'string' || fields.city.trim().length < 2) errors.city = 'Enter your city.'
    const service = getServiceability(fields?.pincode, config)
    if (!service.serviceable) errors.pincode = service.message
  } else if (!config.stores?.some((store) => store.id === storeId)) errors.storeId = 'Choose a pickup store.'
  const scheduleError = validateSchedule(requestedDate, slotId, fulfilment, storeId, config, now)
  if (scheduleError) errors[requestedDate && getAvailableSlots(requestedDate, fulfilment, storeId, config, now).length ? 'slotId' : 'requestedDate'] = scheduleError
  if (!paymentChoices(fulfilment, config).some((choice) => choice.id === paymentMethod)) errors.paymentMethod = 'Choose an available payment preference.'
  return errors
}

function normalizedItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 100) throw new Error('Choose between 1 and 100 basket lines.')
  return items.map((item) => {
    const product = item.id === HAMPER_PRODUCT_ID ? getHamperProduct(item) : products.find((entry) => entry.id === item.id)
    if (!product || product.available === false) throw new Error('An item is no longer available. Please update your basket.')
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new Error('Choose a quantity from 1 to 99 for each item.')
    if (product.weights?.length && !product.weights.some((weight) => weight.label === item.weight)) throw new Error('Please choose an available weight for each item.')
    if (product.flavours?.length && !product.flavours.includes(item.flavour)) throw new Error('Please choose an available flavour for each item.')
    const cake = product.collection === 'cakes'
    const eggPreference = item.eggPreference === 'with-egg' ? 'with-egg' : 'eggless'
    return { id: item.id, name: product.name, quantity: item.quantity, weight: item.weight || '', flavour: item.flavour || '', ...(cake ? { eggPreference, cakeMessage: singleLine(item.cakeMessage, 80) } : {}), ...(product.hamper ? { hamper: product.hamper } : {}), unitPrice: Number.isFinite(getUnitPrice(product, item.weight)) ? getUnitPrice(product, item.weight) : null, product }
  })
}

export function buildOrderRequest({ items, fields, fulfilment, storeId, requestedDate, slotId, paymentMethod, couponCode = '', config = ORDERING_CONFIG, now = new Date() }) {
  const errors = validateCheckout({ fields, fulfilment, storeId, requestedDate, slotId, paymentMethod, config, now })
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0])
  const currentItems = normalizedItems(items)
  const totals = checkoutQuote(currentItems, fulfilment, couponCode, config)
  if (totals.offerError) throw new Error(totals.offerError)
  if (totals.needsPriceConfirmation) throw new Error('Some selections need a price before checkout. Please update your basket.')
  const cleanFields = { name: singleLine(fields.name, 120), phone: singleLine(fields.phone, 30), message: singleLine(fields.message, 1500), ...(fulfilment === 'delivery' ? { address: singleLine(fields.address), city: singleLine(fields.city, 80), pincode: singleLine(fields.pincode, 6), landmark: singleLine(fields.landmark, 150) } : {}) }
  const store = config.stores.find((entry) => entry.id === storeId)
  const slot = config.slots.find((entry) => entry.id === slotId)
  const selectedPayment = paymentChoices(fulfilment, config).find((entry) => entry.id === paymentMethod)
  const snapshotItems = currentItems.map(({ product, ...item }) => ({ ...item, ...(item.hamper ? { hamperContents: product.hamperContents?.map((content) => ({ name: content.product.name, weight: content.weight, flavour: content.flavour, quantity: content.quantity })) || [], packaging: product.packaging?.name || '' } : {}) }))
  const details = { items: snapshotItems, fields: cleanFields, fulfilment, storeId, requestedDate, slotId, paymentMethod, couponCode: totals.couponCode, totals, store: fulfilment === 'pickup' ? { name: store.name, address: store.address } : null, slotLabel: slot.label, paymentLabel: selectedPayment.label }
  const fingerprint = JSON.stringify(details)
  // This is a conversation reference, not an order record or payment token.
  // getRandomValues also works on HTTP S3 endpoints, unlike randomUUID.
  const bytes = new Uint8Array(6)
  const suffix = globalThis.crypto?.getRandomValues
    ? Array.from(globalThis.crypto.getRandomValues(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
    : `${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  const reference = `BH-${requestedDate.replaceAll('-', '')}-${suffix.toUpperCase()}`
  const request = { ...details, reference, createdAt: now.toISOString(), orderStatus: 'Awaiting bakery confirmation', paymentStatus: paymentMethod === 'cod' ? 'Unpaid' : 'Not verified — manual payment via WhatsApp', fingerprint }
  request.summary = buildOrderSummary(request, config)
  return request
}

export function buildOrderSummary(request, config = ORDERING_CONFIG) {
  const lines = [`Hello ${config.bakeryName}, I’d like to place an order.`, `Request: ${request.reference}`, `Status: ${request.orderStatus}`, '', 'MY SELECTION']
  request.items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} × ${item.quantity}`, `   ${[item.weight, item.flavour, item.eggPreference ? item.eggPreference === 'eggless' ? 'Eggless preference' : 'With egg preference' : ''].filter(Boolean).join(' · ')}`)
    if (item.cakeMessage) lines.push(`   Cake message: ${item.cakeMessage}`)
    if (item.hamper) {
      for (const content of item.hamperContents || []) lines.push(`   • ${content.name} · ${[content.weight, content.flavour].filter(Boolean).join(' · ')} × ${content.quantity}`)
      if (item.packaging) lines.push(`   Packaging: ${item.packaging}`)
      if (item.hamper.giftMessage) lines.push(`   Gift note: ${singleLine(item.hamper.giftMessage, 240)}`)
    }
    lines.push(`   ${item.unitPrice === null ? 'Price confirmation needed' : `${formatOrderPrice(item.unitPrice)} each · ${formatOrderPrice(item.unitPrice * item.quantity)}`}`)
  })
  lines.push('', request.fulfilment === 'delivery' ? 'HOME DELIVERY' : 'STORE PICKUP', `Name: ${request.fields.name}`, `WhatsApp: ${request.fields.phone}`)
  if (request.fulfilment === 'delivery') {
    lines.push(`Address: ${request.fields.address}`, `${request.fields.city} — ${request.fields.pincode}`)
    if (request.fields.landmark) lines.push(`Landmark: ${request.fields.landmark}`)
  } else lines.push(`Store: ${request.store.name}`, request.store.address)
  lines.push(`Requested date: ${request.requestedDate}`, `Requested slot: ${request.slotLabel} (${config.timezone})`, '', `Subtotal${request.totals.needsPriceConfirmation ? ' (priced items)' : ''}: ${formatOrderPrice(request.totals.subtotal)}`)
  if (request.couponCode) lines.push(`Offer: ${request.couponCode}`)
  if (request.totals.discount) lines.push(`Offer saving: −${formatOrderPrice(request.totals.discount)}`)
  lines.push(`${request.fulfilment === 'delivery' ? 'Delivery charge' : 'Pickup charge'}: ${formatOrderPrice(request.totals.deliveryFee)}`, `Estimated total: ${formatOrderPrice(request.totals.total)}`, `Payment preference: ${request.paymentLabel}`, `Payment status: ${request.paymentStatus}`)
  if (request.fields.message) lines.push(`Special instructions: ${request.fields.message}`)
  lines.push('', 'Please confirm availability, preferences, the requested slot and final amount in WhatsApp.')
  if (request.paymentMethod === 'cod') {
    lines.push(`This is an unpaid cash order request. Payment is due ${request.fulfilment === 'delivery' ? 'on delivery' : 'at pickup'}.`)
  } else {
    lines.push('', 'MANUAL ONLINE PAYMENT', 'Please share your UPI ID or payment QR code and confirm the final amount.', 'I will make the payment myself and send the payment screenshot here along with this order message.', 'Please verify receipt of the payment and confirm my order. No payment has been verified by the website.')
  }
  return lines.join('\n')
}

export function getWhatsAppUrl(number, summary) {
  const digits = String(number || '').replace(/\D/g, '')
  if (!/^[1-9]\d{9,14}$/.test(digits)) throw new Error('The bakery’s WhatsApp number is unavailable. Please contact the bakery directly.')
  return `https://wa.me/${digits}?text=${encodeURIComponent(summary)}`
}
