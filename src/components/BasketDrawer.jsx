import { useState } from 'react'
import { ArrowRight, Check, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import HamperContents from './HamperContents'

export default function BasketDrawer({ basket, onShop }) {
  const [reviewed, setReviewed] = useState(false)
  if (!basket.items.length) return <div className="empty-state basket-empty"><ShoppingBag size={50} strokeWidth={1} /><p className="eyebrow">A LITTLE ROOM FOR SOMETHING GOOD</p><h3>Your basket is waiting.</h3><p>Find a favorite and make yourself<br />a little collection of good things.</p><button className="button button--gold" onClick={onShop}>Explore our bakes<ArrowRight size={17} /></button></div>
  return <div className="basket-content"><p className="basket-intro">Your little collection of good things.</p><div className="basket-items">{basket.items.map((item) => {
    const product = basket.productFor(item)
    if (!product) return null
    return <div className="basket-item" key={item.key}><img src={product.image} alt={product.alt} width="96" height="112" /><div className="basket-item-info"><p className="product-category">{product.category}</p><h3>{product.name}</h3><HamperContents product={product} /><div className="quantity-control"><button aria-label={`Decrease ${product.name} quantity`} onClick={() => { basket.update(item.key, -1); setReviewed(false) }}><Minus size={14} /></button><span aria-label={`${product.name} quantity`}>{item.quantity}</span><button aria-label={`Increase ${product.name} quantity`} disabled={item.quantity >= 99} onClick={() => { basket.update(item.key, 1); setReviewed(false) }}><Plus size={14} /></button></div></div><button className="remove-item icon-button" aria-label={`Remove ${product.name}`} onClick={() => { basket.remove(item.key); setReviewed(false) }}><Trash2 size={17} strokeWidth={1.5} /></button></div>
  })}</div><div className="basket-summary"><div className="basket-summary-row"><span>Items in your basket</span><strong>{basket.count}</strong></div><p>Your selection is saved on this device. Review your basket before sending an enquiry.</p><button className="button button--gold" onClick={() => setReviewed(true)}>{reviewed ? 'Collection saved on this device' : 'Save my collection'}{reviewed ? <Check size={17} /> : <ArrowRight size={17} />}</button>{reviewed && <p className="basket-confirmation" role="status">Your selection is kept in this browser while local storage is available. No order has been placed.</p>}<button className="text-link basket-continue" onClick={onShop}>Keep exploring<ArrowRight size={16} /></button></div></div>
}
