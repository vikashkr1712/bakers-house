import { catalogProducts, getUnitPrice } from '../data/catalog'
import { hamperPackaging } from '../data/hampers'

export const HAMPER_PRODUCT_ID = 'gift-hamper'
export const HAMPER_MAX_PACKS = 8
export const HAMPER_NAME_MAX_LENGTH = 60
export const HAMPER_MESSAGE_MAX_LENGTH = 240

const lineIdentity = ({ id, weight, flavour }) => JSON.stringify([id, weight, flavour])

// Revalidate both new selections and saved baskets against the current catalogue.
// A malformed gift is rejected as a whole so its contents never change silently.
export function normalizeHamperConfig(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  if (typeof value.name !== 'string') return null
  const name = value.name.trim()
  if (!name || name.length > HAMPER_NAME_MAX_LENGTH) return null
  const packaging = hamperPackaging.find((option) => option.id === value.packagingId)
  if (!packaging || !Number.isFinite(packaging.price) || packaging.price < 0) return null
  if (value.giftMessage !== undefined && typeof value.giftMessage !== 'string') return null
  const giftMessage = (value.giftMessage || '').trim()
  if (giftMessage.length > HAMPER_MESSAGE_MAX_LENGTH) return null
  if (!Array.isArray(value.items) || value.items.length < 1 || value.items.length > HAMPER_MAX_PACKS) return null

  let totalPacks = 0
  const contents = new Map()
  for (const line of value.items) {
    if (!line || typeof line !== 'object' || Array.isArray(line)) return null
    const product = catalogProducts.find((entry) => entry.id === line.id)
    if (!product || !['chocolates', 'sweets'].includes(product.collection) || product.available !== true) return null
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > HAMPER_MAX_PACKS) return null
    const weight = line.weight === undefined ? product.weights?.[0]?.label : line.weight
    const flavour = line.flavour === undefined ? product.flavours?.[0] || '' : line.flavour
    if (!product.weights?.some((option) => option.label === weight)) return null
    if (product.flavours?.length ? !product.flavours.includes(flavour) : flavour !== '') return null
    if (!Number.isFinite(getUnitPrice(product, weight)) || getUnitPrice(product, weight) < 0) return null
    totalPacks += line.quantity
    if (totalPacks > HAMPER_MAX_PACKS) return null
    const canonical = { id: product.id, weight, flavour, quantity: line.quantity }
    const identity = lineIdentity(canonical)
    const existing = contents.get(identity)
    if (existing) existing.quantity += line.quantity
    else contents.set(identity, canonical)
  }
  const items = [...contents.values()].sort((first, second) => lineIdentity(first).localeCompare(lineIdentity(second)))
  const presetId = typeof value.presetId === 'string' && value.presetId.length <= 60 ? value.presetId : undefined
  return { name, packagingId: packaging.id, items, giftMessage, ...(presetId ? { presetId } : {}) }
}

export function makeHamperKey(value) {
  const config = normalizeHamperConfig(value)
  if (!config) return null
  // Preset origin does not distinguish otherwise identical gift configurations.
  const { name, packagingId, items, giftMessage } = config
  return `${HAMPER_PRODUCT_ID}::${encodeURIComponent(JSON.stringify({ name, packagingId, items, giftMessage }))}`
}

export function getHamperPrice(value) {
  const config = normalizeHamperConfig(value)
  if (!config) return null
  const packaging = hamperPackaging.find((option) => option.id === config.packagingId)
  return packaging.price + config.items.reduce((total, line) => {
    const product = catalogProducts.find((entry) => entry.id === line.id)
    return total + getUnitPrice(product, line.weight) * line.quantity
  }, 0)
}

export function getHamperProduct(item) {
  const config = normalizeHamperConfig(item?.hamper)
  if (!config || item.id !== HAMPER_PRODUCT_ID) return null
  const packaging = hamperPackaging.find((option) => option.id === config.packagingId)
  const hamperContents = config.items.map((line) => ({ ...line, product: catalogProducts.find((entry) => entry.id === line.id) }))
  const firstProduct = hamperContents[0].product
  const packs = config.items.reduce((total, line) => total + line.quantity, 0)
  const price = getHamperPrice(config)
  const key = makeHamperKey(config)
  return {
    id: HAMPER_PRODUCT_ID, name: config.name, category: 'Gift Hampers', collection: 'hampers',
    note: `${packs} ${packs === 1 ? 'pack' : 'packs'} with ${packaging.name.toLowerCase()}.`,
    description: 'Your selected chocolates and sweets, gathered together as one gift hamper.',
    image: firstProduct.image, images: [firstProduct.image], alt: firstProduct.alt,
    price, weights: [{ label: '1 hamper', price }], flavours: [], available: true,
    hamper: config, hamperContents, packaging, giftMessage: config.giftMessage,
    detailPath: `/gift-hampers?edit=${encodeURIComponent(key)}`,
  }
}
