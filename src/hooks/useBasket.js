import { useEffect, useState } from 'react'
import { products } from '../data/products'
import { getUnitPrice } from '../data/catalog'
import { HAMPER_PRODUCT_ID, getHamperProduct, makeHamperKey, normalizeHamperConfig } from '../utils/hamperBasket'

const STORAGE_KEY = 'bakers-house-basket-v1'

export function makeBasketKey(id, weight = '', flavour = '', eggPreference = 'eggless', cakeMessage = '') {
  const preference = eggPreference === 'with-egg' ? 'with-egg' : 'eggless'
  const message = typeof cakeMessage === 'string' ? cakeMessage.trim().slice(0, 80) : ''
  const parts = [id, weight, flavour]
  // Keep saved three-part variant keys compatible with existing baskets.
  if (preference !== 'eggless' || message) parts.push(preference, message)
  return parts.map((value) => encodeURIComponent(String(value || ''))).join('::')
}

function optionsFor(product, options = {}) {
  const weights = Array.isArray(product.weights) ? product.weights.map((option) => option.label) : []
  const flavours = Array.isArray(product.flavours) ? product.flavours : []
  return {
    weight: weights.includes(options.weight) ? options.weight : (weights[0] || ''),
    flavour: flavours.includes(options.flavour) ? options.flavour : (flavours[0] || ''),
    ...(product.collection === 'cakes' ? {
      eggPreference: options.eggPreference === 'with-egg' ? 'with-egg' : 'eggless',
      cakeMessage: typeof options.cakeMessage === 'string' ? options.cakeMessage.trim().slice(0, 80) : '',
    } : {}),
  }
}

function positiveQuantity(value, fallback = 1) {
  return Number.isFinite(value) ? Math.max(1, Math.min(99, Math.floor(value))) : fallback
}

function readBasket() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(saved)) return []
    return saved.reduce((items, item) => {
      if (!item || typeof item !== 'object' || !Number.isInteger(item.quantity) || item.quantity <= 0) return items
      if (item.id === HAMPER_PRODUCT_ID || item.kind === 'hamper' || item.hamper) {
        if (item.id !== HAMPER_PRODUCT_ID) return items
        const hamper = normalizeHamperConfig(item.hamper)
        if (!hamper) return items
        const key = makeHamperKey(hamper)
        const existing = items.find((entry) => entry.key === key)
        if (existing) existing.quantity = Math.min(99, existing.quantity + item.quantity)
        else items.push({ id: HAMPER_PRODUCT_ID, kind: 'hamper', key, weight: '1 hamper', flavour: '', hamper, quantity: positiveQuantity(item.quantity) })
        return items
      }
      const product = products.find((entry) => entry.id === item.id)
      if (!product) return items
      const selection = optionsFor(product, item)
      const key = makeBasketKey(product.id, selection.weight, selection.flavour, selection.eggPreference, selection.cakeMessage)
      const existing = items.find((entry) => entry.key === key)
      if (existing) existing.quantity = Math.min(99, existing.quantity + item.quantity)
      else items.push({ id: product.id, key, ...selection, quantity: positiveQuantity(item.quantity) })
      return items
    }, [])
  } catch { return [] }
}

export function useBasket() {
  const [items, setItems] = useState(readBasket)
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* Basket still works when storage is unavailable. */ } }, [items])
  function add(id, options = {}) {
    const product = products.find((entry) => entry.id === id)
    if (!product || product.available === false) return null
    const selection = options && typeof options === 'object' ? options : {}
    const normalized = optionsFor(product, selection)
    const key = makeBasketKey(id, normalized.weight, normalized.flavour, normalized.eggPreference, normalized.cakeMessage)
    const quantity = positiveQuantity(selection.quantity)
    setItems((current) => current.some((item) => item.key === key)
      ? current.map((item) => item.key === key ? { ...item, quantity: Math.min(99, item.quantity + quantity) } : item)
      : [...current, { id, key, ...normalized, quantity }])
    return key
  }
  function updateSelection(token, patch = {}) {
    const previous = items.find((item) => item.key === token) || items.find((item) => item.id === token)
    const product = previous && products.find((entry) => entry.id === previous.id)
    if (!product || product.available === false || !patch || typeof patch !== 'object' || Array.isArray(patch)) return null
    const selection = optionsFor(product, { ...previous, ...patch })
    const key = makeBasketKey(product.id, selection.weight, selection.flavour, selection.eggPreference, selection.cakeMessage)
    setItems((current) => {
      const target = current.find((item) => item.key === previous.key)
      if (!target) return current
      const matching = current.find((item) => item.key === key && item.key !== target.key)
      if (matching) return current.filter((item) => item.key !== target.key).map((item) => item.key === key ? { ...item, quantity: Math.min(99, item.quantity + target.quantity) } : item)
      return current.map((item) => item.key === target.key ? { ...item, ...selection, key } : item)
    })
    return key
  }
  function addHamper(config, options = {}) {
    const hamper = normalizeHamperConfig(config)
    if (!hamper) return null
    const selection = options && typeof options === 'object' ? options : {}
    const replaceKey = typeof selection.replaceKey === 'string' ? selection.replaceKey : null
    if (replaceKey && !items.some((item) => item.key === replaceKey && item.kind === 'hamper')) return null
    const key = makeHamperKey(hamper)
    setItems((current) => {
      const previous = replaceKey ? current.find((item) => item.key === replaceKey && item.kind === 'hamper') : null
      if (replaceKey && !previous) return current
      const quantity = previous ? previous.quantity : positiveQuantity(selection.quantity)
      const remaining = previous ? current.filter((item) => item.key !== replaceKey) : current
      return remaining.some((item) => item.key === key)
        ? remaining.map((item) => item.key === key ? { ...item, quantity: Math.min(99, item.quantity + quantity) } : item)
        : [...remaining, { id: HAMPER_PRODUCT_ID, kind: 'hamper', key, weight: '1 hamper', flavour: '', hamper, quantity }]
    })
    return key
  }
  function productFor(item) {
    return item?.id === HAMPER_PRODUCT_ID ? getHamperProduct(item) : products.find((entry) => entry.id === item?.id)
  }
  function update(token, difference) {
    if (!Number.isInteger(difference)) return
    setItems((current) => {
      const index = current.findIndex((item) => item.key === token)
      const target = index >= 0 ? index : current.findIndex((item) => item.id === token)
      return current.map((item, itemIndex) => itemIndex === target ? { ...item, quantity: Math.min(99, item.quantity + difference) } : item).filter((item) => item.quantity > 0)
    })
  }
  function remove(token) {
    setItems((current) => {
      const index = current.findIndex((item) => item.key === token)
      const target = index >= 0 ? index : current.findIndex((item) => item.id === token)
      return current.filter((_, itemIndex) => itemIndex !== target)
    })
  }
  const subtotal = items.reduce((total, item) => {
    const product = productFor(item)
    const price = product ? getUnitPrice(product, item.weight) : null
    return total + (Number.isFinite(price) ? price * item.quantity : 0)
  }, 0)
  return { items, add, addHamper, productFor, update, updateSelection, remove, clear: () => setItems([]), count: items.reduce((total, item) => total + item.quantity, 0), subtotal }
}
