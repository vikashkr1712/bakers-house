import { products } from '../data/products.js'
import { getUnitPrice } from '../data/catalog.js'
import { getHamperProduct, HAMPER_PRODUCT_ID } from './hamperBasket.js'
import { getCheckoutTotals } from './checkoutPricing.js'
import { ORDERING_CONFIG } from '../config/ordering.js'
import { getAvailableSlots, getServiceability, validateSchedule } from './fulfilment.js'

export const REQUESTS_STORAGE_KEY = 'bakers-house-whatsapp-requests-v1'
const REQUEST_TTL = 7 * 24 * 60 * 60 * 1000
const singleLine = (value, max = 300) => String(value ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max)
export const formatOrderPrice = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)

export function paymentChoices(fulfilment, config = ORDERING_CONFIG) {
  return [
    ...(config.onlinePayment?.enabled ? [{ id: 'payment-link', label: 'Pay online · Razorpay Test Mode', description: 'Choose a payment method on Razorpay. We verify your test payment before opening WhatsApp. No real money is charged.' }] : []),
    ...(fulfilment === 'delivery' && config.delivery?.cashOnDelivery ? [{ id: 'cod', label: 'Cash on delivery', description: 'Pay when your order arrives. Send the saved request to the bakery for confirmation.' }] : []),
    ...(fulfilment === 'pickup' && config.payAtPickup ? [{ id: 'cod', label: 'Pay at pickup', description: 'Pay at the store when you collect. Send the saved request to the bakery for confirmation.' }] : []),
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
  const cleanFields = { name: singleLine(fields.name, 120), phone: singleLine(fields.phone, 30), message: singleLine(fields.message, 1500), ...(fulfilment === 'delivery' ? { address: singleLine(fields.address), city: singleLine(fields.city, 80), pincode: singleLine(fields.pincode, 6), landmark: singleLine(fields.landmark, 150) } : {}) }
  const store = config.stores.find((entry) => entry.id === storeId)
  const slot = config.slots.find((entry) => entry.id === slotId)
  const selectedPayment = paymentChoices(fulfilment, config).find((entry) => entry.id === paymentMethod)
  const snapshotItems = currentItems.map(({ product, ...item }) => ({ ...item, ...(item.hamper ? { hamperContents: product.hamperContents?.map((content) => ({ name: content.product.name, weight: content.weight, flavour: content.flavour, quantity: content.quantity })) || [], packaging: product.packaging?.name || '' } : {}) }))
  const details = { items: snapshotItems, fields: cleanFields, fulfilment, storeId, requestedDate, slotId, paymentMethod, couponCode: totals.couponCode, totals, store: fulfilment === 'pickup' ? { name: store.name, address: store.address } : null, slotLabel: slot.label, paymentLabel: selectedPayment.label }
  const fingerprint = JSON.stringify(details)
  const reference = `BH-${requestedDate.replaceAll('-', '')}-${globalThis.crypto.randomUUID().slice(0, 8).toUpperCase()}`
  const request = { ...details, reference, createdAt: now.toISOString(), orderStatus: 'Awaiting test payment', paymentStatus: 'Unpaid', fingerprint }
  request.summary = buildOrderSummary(request, config)
  return request
}

export function buildOrderSummary(request, config = ORDERING_CONFIG) {
  const lines = [`Hello ${config.bakeryName}, I’d like to place an order.`, `Request: ${request.reference}`, `Status: ${request.orderStatus}`, '', 'MY SELECTION']
  request.items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} × ${item.quantity}`, `   ${[item.weight, item.flavour, item.eggPreference ? item.eggPreference === 'eggless' ? 'Eggless preference' : 'With egg preference' : ''].filter(Boolean).join(' · ')}`)
    if (item.cakeMessage) lines.push(`   Cake message: ${item.cakeMessage}`)
    if (item.hamper) {
      for (const content of item.hamperContents || []) lines.push(`   • ${content.name} · ${content.weight} × ${content.quantity}`)
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
  lines.push(`${request.fulfilment === 'delivery' ? 'Delivery charge' : 'Pickup charge'}: ${formatOrderPrice(request.totals.deliveryFee)}`, `${request.totals.needsPriceConfirmation ? 'Priced total' : 'Total'}: ${formatOrderPrice(request.totals.total)}`, `Payment preference: ${request.paymentLabel}`, `Payment status: ${request.paymentStatus}`)
  if (request.fields.message) lines.push(`Special instructions: ${request.fields.message}`)
  lines.push('', 'Please confirm availability, preferences, the requested slot and final amount before arranging payment.', 'This is an order request. No payment has been verified.')
  return lines.join('\n')
}

export function getWhatsAppUrl(number, summary) {
  const digits = String(number || '').replace(/\D/g, '')
  if (!/^[1-9]\d{9,14}$/.test(digits)) throw new Error('The bakery’s WhatsApp number is unavailable. Please contact the bakery directly.')
  return `https://wa.me/${digits}?text=${encodeURIComponent(summary)}`
}

export function getSavedRequests(storage, now = new Date()) {
  try {
    const target = storage ?? globalThis.localStorage
    const saved = JSON.parse(target.getItem(REQUESTS_STORAGE_KEY))
    if (!Array.isArray(saved)) return []
    const current = saved.filter((entry) => entry && typeof entry.reference === 'string' && typeof entry.summary === 'string' && typeof entry.fingerprint === 'string' && Array.isArray(entry.items) && entry.fields && Number.isFinite(Date.parse(entry.createdAt)) && now.getTime() - Date.parse(entry.createdAt) >= 0 && now.getTime() - Date.parse(entry.createdAt) < REQUEST_TTL).slice(0, 10)
    if (current.length !== saved.length) { try { target.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(current)) } catch { /* Reading remains useful if cleanup is blocked. */ } }
    return current
  } catch { return [] }
}

export function saveOrderRequest(request, storage) {
  try {
    const target = storage ?? globalThis.localStorage
    const saved = getSavedRequests(target, new Date(request.createdAt))
    const existing = saved.find((entry) => entry.fingerprint === request.fingerprint && Date.parse(request.createdAt) - Date.parse(entry.createdAt) < 24 * 60 * 60 * 1000)
    if (existing) return existing
    const next = [request, ...saved].slice(0, 10)
    target.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(next))
    if (target.getItem(REQUESTS_STORAGE_KEY) !== JSON.stringify(next)) throw new Error('Storage did not save the request.')
    return request
  } catch { throw new Error('Your request could not be saved in this browser. Enable browser storage and try again. Your basket has not been cleared.') }
}
