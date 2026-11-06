// Illustrative gift packaging and combinations for the local demo catalogue.
// Final availability and fulfilment are confirmed separately; checkout never places an order.
export const hamperPackaging = [
  { id: 'classic-box', name: 'Classic gift box', price: 99, description: 'A simple, thoughtful finish for your sweet selection.' },
  { id: 'keepsake-box', name: 'Keepsake gift box', price: 199, description: 'A little extra presentation for a special occasion.' },
  { id: 'woven-basket', name: 'Gift basket', price: 249, description: 'An open basket presentation for a generous gesture.' },
]

export const readyMadeHampers = [
  {
    id: 'chocolate-lover', presetId: 'chocolate-lover', name: 'The Chocolate Lover',
    description: 'Rich truffles, dark chocolate and a little nutty crunch. A collection for the cocoa devotee.',
    packagingId: 'classic-box', giftMessage: '',
    items: [
      { id: 'chocolates-signature-truffles', weight: '250 g', flavour: 'Dark Chocolate', quantity: 1 },
      { id: 'chocolates-nut-chocolate-bars', weight: '250 g', flavour: 'Nut & Coconut', quantity: 1 },
      { id: 'chocolates-dark-chocolate-bites', weight: '250 g', flavour: 'Dark Chocolate', quantity: 1 },
    ],
  },
  {
    id: 'traditional-sweet-box', presetId: 'traditional-sweet-box', name: 'The Traditional Sweet Box',
    description: 'Motichoor laddu, kaju katli and rasgulla. Familiar favourites, brought together with care.',
    packagingId: 'classic-box', giftMessage: '',
    items: [
      { id: 'sweets-motichoor-laddu', weight: '250 g', flavour: 'Classic', quantity: 1 },
      { id: 'sweets-kaju-katli', weight: '250 g', flavour: 'Cashew', quantity: 1 },
      { id: 'sweets-rasgulla', weight: '250 g', flavour: 'Classic', quantity: 1 },
    ],
  },
  {
    id: 'sweet-cocoa-celebration', presetId: 'sweet-cocoa-celebration', name: 'Sweet & Cocoa Celebration',
    description: 'A meeting of chocolates and traditional sweets, for the moments you love to share.',
    packagingId: 'keepsake-box', giftMessage: '',
    items: [
      { id: 'chocolates-signature-truffles', weight: '250 g', flavour: 'Dark Chocolate', quantity: 1 },
      { id: 'chocolates-chocolate-pralines', weight: '250 g', flavour: 'Hazelnut Chocolate', quantity: 1 },
      { id: 'sweets-kaju-katli', weight: '250 g', flavour: 'Cashew', quantity: 1 },
      { id: 'sweets-motichoor-laddu', weight: '250 g', flavour: 'Classic', quantity: 1 },
    ],
  },
]
