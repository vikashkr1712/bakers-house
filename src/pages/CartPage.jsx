import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronRight, Heart, Minus, Plus, ShoppingBag, Trash2, Wheat } from 'lucide-react'
import { products } from '../data/products'
import { formatPrice, getUnitPrice } from '../data/catalog'
import '../styles/cart.css'

function ProductLink({ product, onProduct, children, ...props }) {
  return product.detailPath
    ? <Link to={product.detailPath} state={{ from: '/cart' }} {...props}>{children}</Link>
    : <button onClick={() => onProduct(product)} {...props}>{children}</button>
}

export default function CartPage({ basket, onShop, onAdd, onProduct }) {
  const [reviewed, setReviewed] = useState(false)
  const pageRef = useRef(null)
  const focusAfterChange = useRef(null)
  const items = basket.items.map((item) => ({ ...item, product: products.find((product) => product.id === item.id) })).filter((item) => item.product)
  const pricedItems = items.filter((item) => Number.isFinite(getUnitPrice(item.product, item.weight)))
  const unpricedCount = items.length - pricedItems.length
  const subtotal = pricedItems.reduce((total, item) => total + getUnitPrice(item.product, item.weight) * item.quantity, 0)
  const suggestions = products.filter((product) => !items.some((item) => item.id === product.id)).slice(0, 3)
  useEffect(() => {
    setReviewed(false)
    const intent = focusAfterChange.current
    focusAfterChange.current = null
    if (!intent || !pageRef.current) return
    const controls = pageRef.current.querySelectorAll(intent.type === 'add' ? '.cart-recommendation-add' : '.cart-item .cart-remove')
    const target = controls[Math.min(intent.index, controls.length - 1)]
      || pageRef.current.querySelector(intent.type === 'remove' ? '.cart-empty-copy .button' : '#cart-title')
    target?.focus({ preventScroll: true })
  }, [basket.items])

  return <div className="cart-page" ref={pageRef}>
    <section className="cart-intro" aria-labelledby="cart-title">
      <div className="container">
        <nav className="cart-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">Your basket</span></nav>
        <div className="cart-intro-row">
          <div><p className="eyebrow">A FEW OF YOUR FAVORITE THINGS</p><h1 id="cart-title" tabIndex={-1}>Your basket<span>.</span></h1><p className="cart-intro-description">Good things, gathered together.</p></div>
          <div className="cart-intro-seal" aria-hidden="true"><Wheat size={38} strokeWidth={1.1} /><span>MADE WITH CARE<br />CHOSEN BY YOU</span></div>
        </div>
      </div>
    </section>

    <section className="cart-collection" aria-label="Your bakery collection">
      <div className="container">
        {items.length ? <div className="cart-layout">
          <div className="cart-selection">
            <div className="cart-selection-heading"><h2>Your selection</h2><p aria-live="polite">{basket.count} {basket.count === 1 ? 'item' : 'items'} in your basket</p></div>
            <div className="cart-items">
              {items.map(({ key, quantity, weight, flavour, product }, index) => {
                const variant = [weight, flavour].filter(Boolean).join(' · ')
                const label = `${product.name}${variant ? `, ${variant}` : ''}`
                const unitPrice = getUnitPrice(product, weight)
                return <article className="cart-item" key={key}>
                <ProductLink product={product} onProduct={onProduct} className="cart-item-photo" aria-label={`View ${product.name}`}><img src={product.image} alt={product.alt} width="640" height="720" decoding="async" /></ProductLink>
                <div className="cart-item-copy">
                  <p className="cart-item-category">{product.category}</p>
                  <h2><ProductLink product={product} onProduct={onProduct}>{product.name}</ProductLink></h2>
                  <p className="cart-item-note">{product.note}</p>
                  {variant && <p className="cart-item-variant">{variant}</p>}
                  <div className="cart-item-prices">{Number.isFinite(unitPrice) ? <><span>{formatPrice(unitPrice)} each</span><strong>{formatPrice(unitPrice * quantity)}</strong></> : <span>Price on request</span>}</div>
                  <div className="cart-item-controls">
                    <div className="quantity-control cart-quantity" role="group" aria-label={`${label} quantity controls`}>
                      <button aria-label={`Decrease ${label} quantity`} disabled={quantity <= 1} onClick={() => basket.update(key, -1)}><Minus size={16} aria-hidden="true" /></button>
                      <span aria-label={`${label} quantity`} aria-live="polite">{quantity}</span>
                      <button aria-label={`Increase ${label} quantity`} disabled={quantity >= 99} onClick={() => basket.update(key, 1)}><Plus size={16} aria-hidden="true" /></button>
                    </div>
                    <button className="cart-remove" aria-label={`Remove ${label}`} onClick={() => { focusAfterChange.current = { type: 'remove', index }; basket.remove(key) }}><Trash2 size={17} strokeWidth={1.5} aria-hidden="true" /><span>Remove</span></button>
                  </div>
                </div>
              </article>})}
            </div>
            <button className="text-link cart-continue" onClick={onShop}><ArrowLeft size={17} aria-hidden="true" />Continue browsing</button>
            <p className="cart-selection-note"><Heart size={17} strokeWidth={1.4} aria-hidden="true" /><span>A little collection to come back to. Your basket stays saved in this browser.</span></p>
          </div>

          <aside className="cart-summary" aria-labelledby="cart-summary-title">
            <div className="cart-summary-heading"><ShoppingBag size={24} strokeWidth={1.3} aria-hidden="true" /><p className="eyebrow">YOUR LITTLE COLLECTION</p></div>
            <h2 id="cart-summary-title">Collection summary</h2>
            <dl className="cart-summary-details"><div><dt>Selections</dt><dd>{items.length}</dd></div><div><dt>Total items</dt><dd>{basket.count}</dd></div><div className="cart-summary-subtotal"><dt>{unpricedCount ? 'Priced items subtotal' : 'Subtotal'}</dt><dd>{pricedItems.length ? formatPrice(subtotal) : 'Price on request'}</dd></div></dl>
            <p className="cart-summary-message">{unpricedCount ? 'Your enquiry will include the selections marked price on request.' : 'Your favourites, ready for a little celebration.'}</p>
            <Link className="button button--gold cart-checkout" to="/checkout">{pricedItems.length ? 'Continue to checkout' : 'Review order enquiry'}<ArrowRight size={19} aria-hidden="true" /></Link>
            <button className="button button--gold cart-save" onClick={() => setReviewed(true)}>{reviewed ? 'Collection saved' : 'Save my collection'}{reviewed ? <Check size={19} aria-hidden="true" /> : <ArrowRight size={19} aria-hidden="true" />}</button>
            <div className="cart-save-status" role="status">{reviewed && <p><Check size={17} aria-hidden="true" /><span>Your selection is saved in this browser. No order has been placed.</span></p>}</div>
            <div className="cart-order-note"><span className="cart-order-label">A NOTE BEFORE YOU GO</span><p>Payment is not collected online. Review your selection and send an order enquiry to confirm availability and the final amount.</p></div>
          </aside>
        </div> : <div className="cart-empty">
          <div className="cart-empty-copy"><span className="cart-empty-icon" aria-hidden="true"><ShoppingBag size={32} strokeWidth={1.2} /></span><p className="eyebrow">ROOM FOR SOMETHING LOVELY</p><h2>Your basket<br /> is waiting.</h2><p>From a favorite daily loaf to a little sweet indulgence, there’s something good to make your own.</p><button className="button button--gold" onClick={onShop}>Explore our bakes<ArrowRight size={18} aria-hidden="true" /></button><span className="cart-empty-note">Find a favorite. Start a little collection.</span></div>
          <div className="cart-empty-visual"><img src="/images/bakery/banners/banner-fresh-pastries.webp" alt="Freshly baked pastries waiting to be enjoyed" width="2000" height="1000" decoding="async" /><span><Wheat size={23} strokeWidth={1.2} aria-hidden="true" />Good things are worth gathering.</span></div>
        </div>}

        {suggestions.length > 0 && <section className="cart-recommendations" aria-labelledby="cart-suggestions-title">
          <div className="cart-recommendations-heading"><div><p className="eyebrow">A LITTLE BAKERY INSPIRATION</p><h2 id="cart-suggestions-title">A little more to love<span>.</span></h2></div><p>Something for now.<br />Something for sharing.</p></div>
          <div className="cart-recommendation-grid">{suggestions.map((product, index) => <article className="cart-recommendation" key={product.id}>
            <ProductLink product={product} onProduct={onProduct} className="cart-recommendation-photo" aria-label={`View ${product.name}`}><img src={product.image} alt={product.alt} width="640" height="720" loading="lazy" decoding="async" /><span aria-hidden="true"><ArrowUpRight size={20} strokeWidth={1.5} /></span></ProductLink>
            <div className="cart-recommendation-copy"><div><p className="cart-item-category">{product.category}</p><h3><ProductLink product={product} onProduct={onProduct}>{product.name}</ProductLink></h3><p className="cart-item-note">{Number.isFinite(getUnitPrice(product)) ? `From ${formatPrice(getUnitPrice(product))}` : product.note}</p></div><button className="cart-recommendation-add" disabled={product.available === false} aria-label={`Add ${product.name} to basket`} onClick={() => { focusAfterChange.current = { type: 'add', index }; onAdd(product) }}><Plus size={20} strokeWidth={1.5} aria-hidden="true" /></button></div>
          </article>)}</div>
        </section>}
      </div>
    </section>
  </div>
}
