// Public storefront settings. Replace these placeholders only after
// the bakery confirms its contact details, service area and hours.
// Nothing here is a secret; never add gateway key secrets to frontend config.
export const ORDERING_CONFIG = {
  bakeryName: 'Baker’s House',
  whatsappNumber: '917982107035',
  stores: [
    {
      id: 'main',
      name: 'Baker’s House · Kalyanpur',
      address: '24 Bakery Lane, Kalyanpur, Kanpur, Uttar Pradesh 208001',
      hours: 'Daily, 10 am – 7 pm',
      // Optional weeklyHours overrides the common weeklyHours below.
    },
  ],
  delivery: {
    enabled: true,
    // Sample pincodes for demonstrating validation; not a verified service area.
    pincodes: ['208001', '208002', '208003'],
    fee: 49,
    cashOnDelivery: true,
  },
  payAtPickup: true,
  onlinePayment: { enabled: true, mode: 'manual-whatsapp' },
  timezone: 'Asia/Kolkata',
  preparationLeadHours: 24,
  maxAdvanceDays: 30,
  // Sunday = 0, Monday = 1, ... Saturday = 6. Use null for a closed day.
  weeklyHours: {
    0: { open: '10:00', close: '19:00' },
    1: { open: '10:00', close: '19:00' },
    2: { open: '10:00', close: '19:00' },
    3: { open: '10:00', close: '19:00' },
    4: { open: '10:00', close: '19:00' },
    5: { open: '10:00', close: '19:00' },
    6: { open: '10:00', close: '19:00' },
  },
  slots: [
    { id: 'morning', label: '10 am – 1 pm', start: '10:00', end: '13:00' },
    { id: 'afternoon', label: '1 pm – 4 pm', start: '13:00', end: '16:00' },
    { id: 'evening', label: '4 pm – 7 pm', start: '16:00', end: '19:00' },
  ],
}
