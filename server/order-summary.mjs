import { ORDERING_CONFIG } from '../src/config/ordering.js'
import { formatOrderPrice } from '../src/utils/whatsappOrder.js'

const line = value => String(value ?? '').replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').replace(/\s+/g, ' ').trim()

export function isOrderHandoffReady(order) {
  return order.status === 'awaiting_bakery_confirmation' && (order.paymentMethod === 'cod' && order.paymentStatus === 'unpaid' || order.paymentMethod === 'payment-link' && order.paymentStatus === 'paid' && /^pay_[A-Za-z0-9]+$/.test(order.paymentId || ''))
}

export function buildCheckoutWhatsAppSummary(order, config = ORDERING_CONFIG) {
  if (!isOrderHandoffReady(order)) return null
  const request = order.request
  const lines = [`Hello ${config.bakeryName}, please review my order request.`, `Order: ${order.reference}`, 'Order status: Awaiting bakery confirmation', 'TEST CHECKOUT — no real payment or bakery booking.', '', 'MY SELECTION']
  request.items.forEach((item, index) => {
    lines.push(`${index + 1}. ${line(item.name)} × ${item.quantity}`)
    const options = [item.weight, item.flavour, item.eggPreference && (item.eggPreference === 'with-egg' ? 'With egg preference' : 'Eggless preference')].filter(Boolean)
    if (options.length) lines.push(`   ${options.map(line).join(' · ')}`)
    if (item.cakeMessage) lines.push(`   Cake message: ${line(item.cakeMessage)}`)
    for (const content of item.hamperContents || []) lines.push(`   • ${line(content.name)} · ${line(content.weight)} · ${line(content.flavour)} × ${content.quantity}`)
    if (item.packaging) lines.push(`   Packaging: ${line(item.packaging)}`)
    if (item.hamper?.giftMessage) lines.push(`   Gift note: ${line(item.hamper.giftMessage)}`)
    lines.push(`   ${formatOrderPrice(item.unitPrice)} each · ${formatOrderPrice(item.unitPrice * item.quantity)}`)
  })
  lines.push('', request.fulfilment === 'delivery' ? 'HOME DELIVERY' : 'STORE PICKUP', `Name: ${line(request.fields.name)}`, `Customer WhatsApp: +${order.customerPhone}`)
  if (request.fulfilment === 'delivery') {
    lines.push(`Address: ${line(request.fields.address)}`, `${line(request.fields.city)} — ${line(request.fields.pincode)}`)
    if (request.fields.landmark) lines.push(`Landmark: ${line(request.fields.landmark)}`)
  } else lines.push(`Store: ${line(request.store?.name)}`, line(request.store?.address))
  lines.push(`Requested date: ${line(request.requestedDate)}`, `Requested slot: ${line(request.slotLabel)} (${config.timezone})`, '', 'ORDER TOTAL', `Subtotal: ${formatOrderPrice(request.totals.subtotal)}`)
  if (request.couponCode) lines.push(`Offer: ${line(request.couponCode)}`)
  if (request.totals.discount) lines.push(`Offer saving: −${formatOrderPrice(request.totals.discount)}`)
  lines.push(`${request.fulfilment === 'delivery' ? 'Delivery charge' : 'Pickup charge'}: ${formatOrderPrice(request.totals.deliveryFee)}`, `Final total: ${formatOrderPrice(order.amount / 100)}`, '', 'PAYMENT')
  if (order.paymentMethod === 'cod') lines.push(`Method: ${request.fulfilment === 'delivery' ? 'Cash on delivery (COD)' : 'Pay at pickup'}`, `Payment status: UNPAID — ${formatOrderPrice(order.amount / 100)} payable ${request.fulfilment === 'delivery' ? 'on delivery' : 'at pickup'}.`)
  else lines.push('Payment status: SUCCESSFUL — verified Razorpay TEST payment. No real money was charged.', `Payment ID: ${order.paymentId}`, `Payment-link reference: ${order.reference}`, `Paid test amount: ${formatOrderPrice(order.amount / 100)}`)
  if (request.fields.message) lines.push('', `Special instructions: ${line(request.fields.message)}`)
  lines.push('', 'Please reply in this chat to confirm or decline availability and the requested slot.', 'Bakery: verify the saved order/payment reference in your records before accepting; WhatsApp message text can be edited by the sender.')
  return lines.join('\n')
}
