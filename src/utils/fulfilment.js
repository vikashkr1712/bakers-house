import { ORDERING_CONFIG } from '../config/ordering.js'

const DAY_MS = 24 * 60 * 60 * 1000
const formatters = new Map()

function dateParts(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(`${value}T00:00:00Z`)
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) return null
  return { year, month, day, weekday: date.getUTCDay(), utc: date.getTime() }
}

function timeMinutes(value) {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function zonedParts(date, timezone) {
  let formatter = formatters.get(timezone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    })
    formatters.set(timezone, formatter)
  }
  return Object.fromEntries(formatter.formatToParts(date).filter((part) => part.type !== 'literal').map(({ type, value }) => [type, Number(value)]))
}

// Convert a wall-clock time to real instants without assuming the browser's
// timezone. A DST gap produces no instant; a repeated hour can produce two.
function wallTimeInstants(date, minutes, timezone) {
  const target = date.utc + minutes * 60000
  const offsets = new Set()
  for (const delta of [-36, -12, 0, 12, 36]) {
    const sample = target + delta * 60 * 60 * 1000
    const parts = zonedParts(new Date(sample), timezone)
    const wall = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute)
    offsets.add(wall - sample)
  }
  const matches = []
  for (const offset of offsets) {
    const instant = target - offset
    const parts = zonedParts(new Date(instant), timezone)
    if (parts.year === date.year && parts.month === date.month && parts.day === date.day && parts.hour * 60 + parts.minute === minutes) matches.push(instant)
  }
  return [...new Set(matches)].sort((a, b) => a - b)
}

export function localDateString(now = new Date(), timezone = ORDERING_CONFIG.timezone) {
  try {
    const date = now instanceof Date ? now : new Date(now)
    if (!Number.isFinite(date.getTime())) return ''
    const parts = zonedParts(date, timezone)
    return `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
  } catch { return '' }
}

export function getScheduleDateBounds(config = ORDERING_CONFIG, now = new Date()) {
  const date = now instanceof Date ? now : new Date(now)
  const timezone = config.timezone || ORDERING_CONFIG.timezone
  const today = localDateString(date, timezone)
  const todayParts = dateParts(today)
  if (!todayParts) return { minDate: '', maxDate: '' }
  const lead = Number.isFinite(config.preparationLeadHours) && config.preparationLeadHours >= 0 ? config.preparationLeadHours : 24
  const maxDays = Number.isInteger(config.maxAdvanceDays) && config.maxAdvanceDays >= 0 ? config.maxAdvanceDays : 30
  return {
    minDate: localDateString(new Date(date.getTime() + lead * 60 * 60 * 1000), timezone),
    // Advance booking is measured in bakery-local calendar days, including DST.
    maxDate: new Date(todayParts.utc + maxDays * DAY_MS).toISOString().slice(0, 10),
  }
}

export function getServiceability(pincode, config = ORDERING_CONFIG) {
  if (!config.delivery?.enabled) return { serviceable: false, fee: 0, message: 'Delivery is currently unavailable. Please choose pickup.' }
  const value = typeof pincode === 'string' ? pincode.trim() : String(pincode ?? '').trim()
  if (!/^[1-9]\d{5}$/.test(value)) return { serviceable: false, fee: 0, message: 'Enter your 6-digit delivery pincode.' }
  if (!config.delivery.pincodes?.includes(value)) return { serviceable: false, fee: 0, message: 'Delivery is unavailable for this pincode. Please choose pickup or another address.' }
  const fee = Number.isFinite(config.delivery.fee) && config.delivery.fee >= 0 ? Math.round(config.delivery.fee * 100) / 100 : 0
  return { serviceable: true, fee, message: config.demo ? 'Demo delivery is available to this pincode.' : 'Delivery is available to this pincode.' }
}

function scheduleContext(value, method, storeId, config, now) {
  if (!['delivery', 'pickup'].includes(method)) return { error: 'Choose delivery or pickup.' }
  if (method === 'delivery' && !config.delivery?.enabled) return { error: 'Delivery is currently unavailable. Please choose pickup.' }
  const store = config.stores?.find((entry) => entry.id === storeId)
  if (method === 'pickup' && !store) return { error: 'Choose a pickup store.' }
  const parsedDate = dateParts(value)
  if (!parsedDate) return { error: 'Choose a valid date.' }
  const instant = now instanceof Date ? now : new Date(now)
  if (!Number.isFinite(instant.getTime())) return { error: 'The current time is unavailable. Please try again.' }
  const timezone = config.timezone || ORDERING_CONFIG.timezone
  const { minDate, maxDate } = getScheduleDateBounds(config, instant)
  if (!minDate || !maxDate) return { error: 'Booking dates are currently unavailable.' }
  const lead = Number.isFinite(config.preparationLeadHours) && config.preparationLeadHours >= 0 ? config.preparationLeadHours : 24
  const maxDays = Number.isInteger(config.maxAdvanceDays) && config.maxAdvanceDays >= 0 ? config.maxAdvanceDays : 30
  if (value < minDate) return { error: `Please allow at least ${lead} hours for preparation.` }
  if (value > maxDate) return { error: `Choose a date within the next ${maxDays} days.` }
  const weeklyHours = method === 'pickup' ? store.weeklyHours ?? config.weeklyHours : config.weeklyHours
  const hours = weeklyHours?.[parsedDate.weekday]
  const open = timeMinutes(hours?.open)
  const close = timeMinutes(hours?.close)
  if (!hours || hours.closed || open === null || close === null || close <= open) return { error: method === 'pickup' ? 'This pickup store is closed on that day. Choose another date.' : 'Delivery is unavailable on that day. Choose another date.' }
  return { parsedDate, timezone, open, close, earliest: instant.getTime() + lead * 60 * 60 * 1000 }
}

export function getAvailableSlots(date, method, storeId = 'main', config = ORDERING_CONFIG, now = new Date()) {
  try {
    const context = scheduleContext(date, method, storeId, config, now)
    if (context.error) return []
    return (Array.isArray(config.slots) ? config.slots : []).filter((slot) => {
      const start = timeMinutes(slot.start)
      const end = timeMinutes(slot.end)
      if (start === null || end === null || end <= start || start < context.open || end > context.close) return false
      // Use the first occurrence when an hour repeats at the end of DST. This
      // prevents a partly elapsed slot being presented as wholly available.
      const instant = wallTimeInstants(context.parsedDate, start, context.timezone)[0]
      return Number.isFinite(instant) && instant >= context.earliest && wallTimeInstants(context.parsedDate, end, context.timezone).some((finish) => finish > instant)
    })
  } catch { return [] }
}

export function validateSchedule(date, slotId, method, storeId = 'main', config = ORDERING_CONFIG, now = new Date()) {
  try {
    const context = scheduleContext(date, method, storeId, config, now)
    if (context.error) return context.error
    if (!slotId) return 'Choose an available time slot.'
    const slots = getAvailableSlots(date, method, storeId, config, now)
    if (!slots.length) return 'No time slots are available for that date. Please choose another date.'
    return slots.some((slot) => slot.id === slotId) ? '' : 'This time slot is no longer available. Choose another time.'
  } catch { return 'Booking times are currently unavailable. Please try again.' }
}
