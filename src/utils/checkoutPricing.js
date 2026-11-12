// Illustrative offers for the order estimate. The bakery confirms final pricing.
export const DEMO_OFFERS = [
  { code: 'SWEET10', title: '10% off your favourites', description: '10% off on ₹500+. Save up to ₹200.', minimum: 500 },
  { code: 'TREAT150', title: 'A little extra sweetness', description: '₹150 off on ₹1,500+.', minimum: 1500 },
  { code: 'FREEDEL', title: 'Delivery, on us', description: 'Free delivery on ₹750+. Delivery only.', minimum: 750 },
]

export function getCheckoutTotals(subtotal, fulfilment = 'pickup', couponCode = '', deliveryFee = 49) {
  const subtotalPaise = Number.isFinite(subtotal) && subtotal >= 0 ? Math.round(subtotal * 100) : 0
  const code = typeof couponCode === 'string' ? couponCode.trim().toUpperCase() : ''
  const offer = DEMO_OFFERS.find((entry) => entry.code === code)
  let offerError = ''
  let discountPaise = 0
  let deliveryPaise = fulfilment === 'delivery' && Number.isFinite(deliveryFee) && deliveryFee >= 0 ? Math.round(deliveryFee * 100) : 0
  if (code && !offer) offerError = 'That offer code is not recognised. Try one of the demo offers below.'
  else if (offer && subtotalPaise < offer.minimum * 100) offerError = `Add more favourites to reach ₹${offer.minimum.toLocaleString('en-IN')} for ${code}.`
  else if (code === 'FREEDEL' && fulfilment !== 'delivery') offerError = 'FREEDEL is for delivery. Pickup is already free.'
  else if (code === 'SWEET10') discountPaise = Math.min(20000, Math.round(subtotalPaise * 0.1))
  else if (code === 'TREAT150') discountPaise = 15000
  else if (code === 'FREEDEL') deliveryPaise = 0
  return {
    subtotal: subtotalPaise / 100,
    discount: discountPaise / 100,
    deliveryFee: deliveryPaise / 100,
    total: Math.max(0, subtotalPaise - discountPaise + deliveryPaise) / 100,
    couponCode: code,
    offerError,
  }
}
