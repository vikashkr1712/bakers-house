import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Minus, Plus, Search, ShoppingBag, Trash2, Wheat } from 'lucide-react'
import Dialog from './Dialog'
import { products } from '../data/products'

function SearchContent({ onProduct }) {
  const [query, setQuery] = useState('')
  const normalized = query.trim().toLowerCase()
  const results = products.filter((product) => `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(normalized))
  return <div className="search-content"><label className="search-label" htmlFor="bakery-search">What are you craving?</label><div className="search-field"><Search size={21} strokeWidth={1.5} /><input id="bakery-search" type="search" placeholder="Try “croissant” or “chocolate”…" aria-label="Search our bakery" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" autoFocus /></div><p className="catalog-count" aria-live="polite">{normalized ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${query.trim()}”` : 'A few things you might love'}</p>{results.length ? <div className="search-results">{results.map((product) => <button className="search-result" key={product.id} onClick={() => onProduct(product)}><img src={product.image} alt="" width="80" height="80" loading="lazy" /><span><span className="product-category">{product.category}</span><span className="search-result-name">{product.name}</span></span><ArrowRight size={18} /></button>)}</div> : <div className="empty-state"><Wheat size={38} strokeWidth={1} /><h3>No bakes found just yet.</h3><p>Try “bread”, “cake”, or a different little craving.</p><button className="text-link" onClick={() => setQuery('')}>Explore all bakes<ArrowRight size={16} /></button></div>}</div>
}

function ProductDetail({ product, onAdd, onBack }) {
  const [added, setAdded] = useState(false)
  return <div className="product-detail"><button className="text-link product-back" onClick={onBack}><ArrowLeft size={16} />Back to the bakery</button><div className="product-detail-grid"><img className="product-detail-image" src={product.image} alt={product.alt} width="640" height="720" /><div className="product-detail-copy"><p className="eyebrow">{product.category}</p><h3>{product.name}</h3><p className="product-detail-note">{product.note}</p><p>{product.description}</p><span className="short-rule" /><button className="button button--gold" onClick={() => { onAdd(product); setAdded(true) }}>{added ? 'Add another' : 'Add to basket'}{added ? <Check size={17} /> : <Plus size={17} />}</button><p className="demo-note">Demo basket · no payment or order is placed. Pricing and availability are coming soon.</p><p className="allergen-note">Please confirm ingredients and allergens with the bakery before ordering.</p></div></div></div>
}

function Basket({ basket, onShop }) {
  const [reviewed, setReviewed] = useState(false)
  if (!basket.items.length) return <div className="empty-state basket-empty"><ShoppingBag size={50} strokeWidth={1} /><p className="eyebrow">A LITTLE ROOM FOR SOMETHING GOOD</p><h3>Your basket is waiting.</h3><p>Find a favorite and make yourself<br />a little collection of good things.</p><button className="button button--gold" onClick={onShop}>Explore our bakes<ArrowRight size={17} /></button></div>
  return <div className="basket-content"><p className="basket-intro">Your little collection of good things.</p><div className="basket-items">{basket.items.map((item) => {
    const product = products.find((product) => product.id === item.id)
    return <div className="basket-item" key={item.id}><img src={product.image} alt={product.alt} width="96" height="112" /><div className="basket-item-info"><p className="product-category">{product.category}</p><h3>{product.name}</h3><div className="quantity-control"><button aria-label={`Decrease ${product.name} quantity`} onClick={() => { basket.update(item.id, -1); setReviewed(false) }}><Minus size={14} /></button><span aria-label={`${product.name} quantity`}>{item.quantity}</span><button aria-label={`Increase ${product.name} quantity`} disabled={item.quantity >= 99} onClick={() => { basket.update(item.id, 1); setReviewed(false) }}><Plus size={14} /></button></div></div><button className="remove-item icon-button" aria-label={`Remove ${product.name}`} onClick={() => { basket.remove(item.id); setReviewed(false) }}><Trash2 size={17} strokeWidth={1.5} /></button></div>
  })}</div><div className="basket-summary"><div className="basket-summary-row"><span>Items in your basket</span><strong>{basket.count}</strong></div><p>This is a demo basket. Prices, payment, and live ordering are not available yet.</p><button className="button button--gold" onClick={() => setReviewed(true)}>{reviewed ? 'Collection saved on this device' : 'Save my collection'}{reviewed ? <Check size={17} /> : <ArrowRight size={17} />}</button>{reviewed && <p className="basket-confirmation" role="status">Your selection is kept in this browser while local storage is available. No order has been placed.</p>}<button className="text-link basket-continue" onClick={onShop}>Keep exploring<ArrowRight size={16} /></button></div></div>
}

function StoryContent({ onShop }) {
  return <div className="editorial-dialog"><p className="eyebrow">THE BAKER’S HOUSE PHILOSOPHY</p><h3>Good things<br />take a little time.</h3><p>There is something quietly wonderful about a bakery. The warmth of an oven. The crackle of a fresh crust. The first, buttery flake of a croissant.</p><p>Baker’s House is built around those simple pleasures. Our inspiration comes from traditional baking: thoughtful ingredients, patient hands, and a deep respect for the craft.</p><p>From an everyday loaf to a cake for a special gathering, our collection is an invitation to slow down, share something good, and enjoy the moment.</p><span className="short-rule" /><button className="button button--gold" onClick={onShop}>Find your favorite<ArrowRight size={17} /></button></div>
}

export default function ShopDialogs({ view, setView, basket, onAdd, onShop, isShop }) {
  const close = () => setView(null)
  const openShop = () => onShop('All')
  const onProduct = (product) => setView({ type: 'product', product })
  const titles = { search: 'Find a little goodness', basket: `Your Basket (${basket.count})`, product: 'From our bakery', story: 'Our Story', contact: 'Let’s talk good baking', privacy: 'Your privacy' }
  if (!view) return null
  return <Dialog key={view.type} title={titles[view.type]} onClose={close} className={`dialog--${view.type}`}>
    {view.type === 'search' && <SearchContent onProduct={onProduct} />}
    {view.type === 'product' && <ProductDetail key={view.product.id} product={view.product} onAdd={onAdd} onBack={() => isShop ? close() : onShop('All')} />}
    {view.type === 'basket' && <Basket basket={basket} onShop={openShop} />}
    {view.type === 'story' && <StoryContent onShop={openShop} />}
    {view.type === 'contact' && <div className="editorial-dialog contact-content"><Wheat size={42} strokeWidth={1} className="contact-wheat" /><p className="eyebrow">GOOD CONVERSATIONS START HERE</p><h3>A neighborhood bakery.<br />A warm welcome.</h3><p>Our store contact details, location, and opening hours will be shared here when they’re available.</p><p>In the meantime, take a look around our bakery collection and find something you’ll love.</p><button className="button button--gold" onClick={openShop}>Explore our bakes<ArrowRight size={17} /></button></div>}
    {view.type === 'privacy' && <div className="editorial-dialog"><p className="eyebrow">SIMPLE AND TRANSPARENT</p><h3>Your device.<br />Your little collection.</h3><p>This frontend demo stores your basket and the email you enter in the demo newsletter form in your browser’s local storage. Neither is sent to a server.</p><p>There are no analytics, tracking cookies, payment services, or live orders. Photography and fonts are hosted locally.</p><button className="button button--gold" onClick={() => { basket.clear(); try { localStorage.removeItem('bakers-house-newsletter-demo') } catch { /* No saved data if storage is disabled. */ } close() }}>Clear saved demo data<Trash2 size={16} /></button></div>}
  </Dialog>
}
