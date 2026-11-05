import { useEffect, useState } from 'react'
import { products } from '../data/products'
import { getUnitPrice } from '../data/catalog'

const STORAGE_KEY = 'bakers-house-basket-v1'

export function makeBasketKey(id, weight = '', flavour = '') {
  return [id, weight, flavour].map((value) => encodeURIComponent(String(value || ''))).join('::')
}

function optionsFor(product, options = {}) {
  const weights = Array.isArray(product.weights) ? product.weights.map((option) => option.label) : []
  const flavours = Array.isArray(product.flavours) ? product.flavours : []
  return {
    weight: weights.includes(options.weight) ? options.weight : (weights[0] || ''),
    flavour: flavours.includes(options.flavour) ? options.flavour : (flavours[0] || ''),
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
      const product = products.find((entry) => entry.id === item.id)
      if (!product) return items
      const { weight, flavour } = optionsFor(product, item)
      const key = makeBasketKey(product.id, weight, flavour)
      const existing = items.find((entry) => entry.key === key)
      if (existing) existing.quantity = Math.min(99, existing.quantity + item.quantity)
      else items.push({ id: product.id, key, weight, flavour, quantity: positiveQuantity(item.quantity) })
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
    const { weight, flavour } = optionsFor(product, selection)
    const key = makeBasketKey(id, weight, flavour)
    const quantity = positiveQuantity(selection.quantity)
    setItems((current) => current.some((item) => item.key === key)
      ? current.map((item) => item.key === key ? { ...item, quantity: Math.min(99, item.quantity + quantity) } : item)
      : [...current, { id, key, weight, flavour, quantity }])
    return key
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
    const product = products.find((entry) => entry.id === item.id)
    const price = product ? getUnitPrice(product, item.weight) : null
    return total + (Number.isFinite(price) ? price * item.quantity : 0)
  }, 0)
  return { items, add, update, remove, clear: () => setItems([]), count: items.reduce((total, item) => total + item.quantity, 0), subtotal }
}
