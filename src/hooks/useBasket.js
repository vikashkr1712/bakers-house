import { useEffect, useState } from 'react'
import { products } from '../data/products'

const STORAGE_KEY = 'bakers-house-basket-v1'

function readBasket() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(saved)) return []
    return saved.filter((item) => products.some((product) => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0).map((item) => ({ id: item.id, quantity: Math.min(item.quantity, 99) }))
  } catch { return [] }
}

export function useBasket() {
  const [items, setItems] = useState(readBasket)
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* Basket still works when storage is unavailable. */ } }, [items])
  function add(id) {
    setItems((current) => current.some((item) => item.id === id)
      ? current.map((item) => item.id === id ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item)
      : [...current, { id, quantity: 1 }])
  }
  function update(id, difference) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.min(99, item.quantity + difference) } : item).filter((item) => item.quantity > 0))
  }
  return { items, add, update, remove: (id) => setItems((current) => current.filter((item) => item.id !== id)), clear: () => setItems([]), count: items.reduce((total, item) => total + item.quantity, 0) }
}
