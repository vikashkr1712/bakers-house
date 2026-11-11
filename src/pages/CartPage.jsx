import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronRight, Heart, Minus, Plus, ShoppingBag, Trash2, Wheat } from 'lucide-react'
import { products } from '../data/products'
import { formatPrice, getUnitPrice } from '../data/catalog'
import HamperContents from '../components/HamperContents'
import '../styles/cart.css'

function ProductLink({ product, onProduct, children, ...props }) {
  return product.detailPath
    ? <Link to={product.detailPath} state={{ from: '/cart' }} {...props}>{children}</Link>
    : <button onClick={() => onProduct(product)} {...props}>{children}</button>
}

function CartCakeOptions({ item, onChange }) {
  const id = useId()
  const [message, setMessage] = useState(item.cakeMessage || '')
  useEffect(() => { setMessage(item.cakeMessage || '') }, [item.cakeMessage])
  function saveMessage() {
    const normalized = message.trim().slice(0, 80)
    if (normalized !== (item.cakeMessage || '')) onChange(item.key, { cakeMessage: normalized })
    setMessage(normalized)
  }
  return <fieldset className="cart-cake-customization">
    <legend>Customize your cake</legend>
    <div className="cart-cake-options">
      <div><label htmlFor={`${id}-weight`}>Weight</label><select id={`${id}-weight`} data-selection-field="weight" value={item.weight} aria-label={`Weight for ${item.product.name}`} onChange={(event) => onChange(item.key, { weight: event.target.value }, 'weight')}>{item.product.weights.map((option) => <option key={option.label} value={option.label}>{option.label}</option>)}</select></div>
      <div><label htmlFor={`${id}-flavour`}>Flavour</label><select id={`${id}-flavour`} data-selection-field="flavour" value={item.flavour} aria-label={`Flavour for ${item.product.name}`} onChange={(event) => onChange(item.key, { flavour: event.target.value }, 'flavour')}>{item.product.flavours.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
      <div><label htmlFor={`${id}-egg`}>Egg preference</label><select id={`${id}-egg`} data-selection-field="eggPreference" value={item.eggPreference || 'eggless'} aria-label={`Egg preference for ${item.product.name}`} onChange={(event) => onChange(item.key, { eggPreference: event.target.value }, 'eggPreference')}><option value="eggless">Eggless</option><option value="with-egg">With egg</option></select></div>
      <div className="cart-cake-message"><label htmlFor={`${id}-message`}>Message on cake <span>(optional)</span></label><input id={`${id}-message`} data-selection-field="cakeMessage" value={message} maxLength={80} aria-label={`Message on cake for ${item.product.name}`} aria-describedby={`${id}-help`} placeholder="A little birthday wish…" onChange={(event) => setMessage(event.target.value)} onBlur={saveMessage} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() } }} /></div>
    </div>
    <p id={`${id}-help`}>Up to 80 characters. Preferences are subject to bakery confirmation.</p>
  </fieldset>
}

export default function CartPage({ basket, onShop, onAdd, onProduct }) {
  const [reviewed, setReviewed] = useState(false)
  const pageRef = useRef(null)
  const focusAfterChange = useRef(null)
  const rowKeys = useRef(new Map())
  const nextRowKey = useRef(0)
  const items = basket.items.map((item) => ({ ...item, product: basket.productFor(item) })).filter((item) => item.product)
  const pricedItems = items.filter((item) => Number.isFinite(getUnitPrice(item.product, item.weight)))
  const unpricedCount = items.length - pricedItems.length
  const subtotal = pricedItems.reduce((total, item) => total + getUnitPrice(item.product, item.weight) * item.quantity, 0)
  const suggestions = products.filter((product) => !items.some((item) => item.id === product.id)).slice(0, 3)
  for (const item of items) if (!rowKeys.current.has(item.key)) rowKeys.current.set(item.key, `cart-row-${nextRowKey.current++}`)
  function updateCakeSelection(token, patch, field) {
    const key = basket.updateSelection(token, patch)
    if (!key) return
    if (key !== token) {
      if (!rowKeys.current.has(key)) rowKeys.current.set(key, rowKeys.current.get(token))
      rowKeys.current.delete(token)
    }
    if (field) focusAfterChange.current = { type: 'selection', key, field }
  }
  useEffect(() => {
    setReviewed(false)
    const intent = focusAfterChange.current
    focusAfterChange.current = null
    if (!intent || !pageRef.current) return
    if (intent.type === 'selection') {
      const row = [...pageRef.current.querySelectorAll('.cart-item')].find((element) => element.dataset.basketKey === intent.key)
      row?.querySelector(`[data-selection-field="${intent.field}"]`)?.focus({ preventScroll: true })
      return
    }
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
              {items.map((item, index) => {
                const { key, quantity, weight, flavour, product } = item
                const variant = [weight, flavour].filter(Boolean).join(' · ')
                const label = `${product.name}${variant ? `, ${variant}` : ''}`
                const unitPrice = getUnitPrice(product, weight)
                return <article className="cart-item" key={rowKeys.current.get(key)} data-basket-key={key}>
                <ProductLink product={product} onProduct={onProduct} className="cart-item-photo" aria-label={`View ${product.name}`}><img src={product.image} alt={product.alt} width="640" height="720" decoding="async" /></ProductLink>
                <div className="cart-item-copy">
                  <p className="cart-item-category">{product.category}</p>
                  <h2><ProductLink product={product} onProduct={onProduct}>{product.name}</ProductLink></h2>
                  <p className="cart-item-note">{product.note}</p>
                  {variant && <p className="cart-item-variant">{variant}</p>}
                  <HamperContents product={product} />
                  {product.collection === 'hampers' && <Link className="hamper-edit-link" to={product.detailPath}>Edit hamper</Link>}
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
                {product.collection === 'cakes' && <CartCakeOptions item={item} onChange={updateCakeSelection} />}
              </article>})}
            </div>
            <button className="text-link cart-continue" onClick={onShop}><ArrowLeft size={17} aria-hidden="true" />Continue browsing</button>
            <p className="cart-selection-note"><Heart size={17} strokeWidth={1.4} aria-hidden="true" /><span>A little collection to come back to. Your basket stays saved in this browser.</span></p>
          </div>

          <aside className="cart-summary" aria-labelledby="cart-summary-title">
            <div className="cart-summary-heading"><ShoppingBag size={24} strokeWidth={1.3} aria-hidden="true" /><p className="eyebrow">YOUR LITTLE COLLECTION</p></div>
            <h2 id="cart-summary-title">Collection summary</h2>
            <dl className="cart-summary-details"><div><dt>Selections</dt><dd>{items.length}</dd></div><div><dt>Total items</dt><dd>{basket.count}</dd></div><div className="cart-summary-subtotal"><dt>{unpricedCount ? 'Priced items subtotal' : 'Subtotal'}</dt><dd>{pricedItems.length ? formatPrice(subtotal) : 'Price on request'}</dd></div></dl>
            <p className="cart-summary-message">{unpricedCount ? 'The bakery will confirm prices for items marked price on request.' : 'Your favourites, ready for a little celebration.'}</p>
            <Link className="button button--gold cart-checkout" to="/checkout">Continue to checkout<ArrowRight size={19} aria-hidden="true" /></Link>
            <button className="button button--gold cart-save" onClick={() => setReviewed(true)}>{reviewed ? 'Collection saved' : 'Save my collection'}{reviewed ? <Check size={19} aria-hidden="true" /> : <ArrowRight size={19} aria-hidden="true" />}</button>
            <div className="cart-save-status" role="status">{reviewed && <p><Check size={17} aria-hidden="true" /><span>Your selection is saved in this browser. No order has been placed.</span></p>}</div>
            <div className="cart-order-note"><span className="cart-order-label">A NOTE BEFORE YOU GO</span><p>Choose pickup or delivery, then try a Razorpay test payment. No real money is charged and no real bakery fulfilment is booked.</p></div>
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
