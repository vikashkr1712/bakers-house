import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { cakeProducts, catalogProducts, formatPrice, getUnitPrice } from '../data/catalog'
import CatalogProductCard from '../components/CatalogProductCard'
import '../styles/catalog.css'
import '../styles/product-gallery.css'

export default function CakeDetailPage({ onAdd, onBuy, collection = 'cakes' }) {
  const { slug } = useParams()
  const location = useLocation()
  const product = (location.pathname.startsWith('/cakes/') ? cakeProducts : catalogProducts).find((item) => item.slug === slug)
  const [weight, setWeight] = useState('')
  const [flavour, setFlavour] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  useEffect(() => { setWeight(product?.weights[0].label || ''); setFlavour(product?.flavours[0] || ''); setQuantity(1); setActiveImage(0) }, [product?.id])
  useEffect(() => { document.title = product ? `${product.name} — Baker’s House` : 'Product Not Found — Baker’s House' }, [product?.id, location.pathname])
  const fallback = product ? `/${product.collection}` : `/${collection}`
  const returnPath = location.state?.from
  const from = typeof returnPath === 'string' && /^\/(cakes|chocolates|sweets|search|cart|shop)\/?(\?[^#]*)?$/.test(returnPath) ? returnPath.replace(/^([^?]+?)\/(?=\?|$)/, '$1') : fallback
  const backLabel = from.startsWith('/shop') ? 'Back to shop' : from.startsWith('/search') ? 'Back to search results' : from.startsWith('/cart') ? 'Back to your basket' : `Back to ${product?.collection === 'cakes' ? 'cakes' : product?.collection || 'the collection'}`

  if (!product) return <div className="catalog-page"><section className="container catalog-not-found"><p className="eyebrow">A LITTLE DETOUR</p><h1>That sweet treat isn’t here.</h1><p>There are plenty more lovely things in the collection.</p><Link to={from} className="button catalog-primary-button">Back to the collection<ArrowRight size={18} /></Link></section></div>

  const chosenWeight = product.weights.some((item) => item.label === weight) ? weight : product.weights[0].label
  const chosenFlavour = product.flavours.includes(flavour) ? flavour : product.flavours[0]
  const unitPrice = getUnitPrice(product, chosenWeight)
  const options = { weight: chosenWeight, flavour: chosenFlavour, quantity }
  const gallery = product.gallery || product.images.map(src => ({ src, alt: product.alt, generated: false }))
  const currentPhoto = gallery[activeImage] || gallery[0]
  const recommendations = catalogProducts.filter((item) => item.collection === product.collection && item.id !== product.id).sort((a, b) => a.bestsellerRank - b.bestsellerRank).slice(0, 3)

  function changeQuantity(value) {
    const parsed = Number.parseInt(value, 10)
    setQuantity(Number.isFinite(parsed) ? Math.min(99, Math.max(1, parsed)) : 1)
  }

  return <div className="catalog-page cake-detail-page">
    <section className="container cake-detail-section" aria-labelledby="cake-detail-title">
      <nav className="catalog-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><Link to={fallback}>{product.category}</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">{product.name}</span></nav>
      <div className="cake-detail-layout">
        <div className="cake-detail-gallery">
          <div className="cake-detail-main-image"><img src={currentPhoto.src} alt={currentPhoto.alt} width="1000" height="1100" fetchPriority="high" />{product.bestseller && <span className="catalog-bestseller">Best seller</span>}
            <button type="button" className="product-gallery-arrow product-gallery-arrow--previous" aria-label={`Previous photograph of ${product.name}`} onClick={() => setActiveImage(index => (index - 1 + gallery.length) % gallery.length)}><ChevronLeft size={20} aria-hidden="true" /></button>
            <button type="button" className="product-gallery-arrow product-gallery-arrow--next" aria-label={`Next photograph of ${product.name}`} onClick={() => setActiveImage(index => (index + 1) % gallery.length)}><ChevronRight size={20} aria-hidden="true" /></button>
            <span className="product-gallery-position" aria-live="polite">{activeImage + 1} / {gallery.length}</span>
          </div>
          <p className="product-gallery-note">{currentPhoto.generated ? `Generated sample · ${currentPhoto.label}. Styling inspiration; the actual product may differ.` : product.imageNote || currentPhoto.label}</p>
          <div className="cake-detail-thumbnails" role="group" aria-label="Product photographs">{gallery.map((photo, index) => <button key={photo.src} type="button" onClick={() => setActiveImage(index)} aria-pressed={activeImage === index} aria-label={`View photograph ${index + 1} of ${product.name}`}><img src={photo.src} alt="" width="100" height="100" loading="lazy" decoding="async" /><span className="product-gallery-thumbnail-number" aria-hidden="true">{index + 1}</span></button>)}</div>
          <Link className="cake-detail-back" to={from}><ArrowLeft size={16} aria-hidden="true" />{backLabel}</Link>
        </div>
        <div className="cake-detail-copy">
          <p className="eyebrow">A LITTLE SOMETHING SPECIAL</p><div className="catalog-product-tags">{product.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <h1 id="cake-detail-title">{product.name}</h1><p className="cake-detail-note">{product.note}</p><p className="cake-detail-price" aria-live="polite">{formatPrice(unitPrice)}<span>/ {chosenWeight}</span></p><p className="cake-detail-description">{product.description}</p>
          <p className={`cake-detail-availability ${!product.available ? 'is-unavailable' : ''}`}>{product.available && <Check size={15} aria-hidden="true" />}{product.available ? 'Available to order' : 'Currently unavailable'}</p>
          <div className="cake-detail-options">
            <fieldset><legend>Choose weight</legend><div className="cake-option-buttons">{product.weights.map((option) => <button key={option.label} type="button" aria-pressed={chosenWeight === option.label} className={chosenWeight === option.label ? 'is-selected' : ''} onClick={() => setWeight(option.label)}>{option.label}</button>)}</div></fieldset>
            <fieldset><legend>{product.flavours.length > 1 ? 'Choose flavour' : 'Flavour'}</legend><div className="cake-option-buttons">{product.flavours.map((option) => <button key={option} type="button" aria-pressed={chosenFlavour === option} className={chosenFlavour === option ? 'is-selected' : ''} onClick={() => setFlavour(option)}>{option}</button>)}</div></fieldset>
          </div>
          <div className="cake-detail-order-row"><div className="cake-detail-quantity-wrap"><label htmlFor="cake-quantity">Quantity</label><div className="cake-detail-quantity"><button onClick={() => changeQuantity(quantity - 1)} disabled={quantity <= 1} aria-label="Decrease quantity"><Minus size={16} /></button><input id="cake-quantity" type="number" inputMode="numeric" min="1" max="99" value={quantity} onChange={(event) => changeQuantity(event.target.value)} /><button onClick={() => changeQuantity(quantity + 1)} disabled={quantity >= 99} aria-label="Increase quantity"><Plus size={16} /></button></div></div><p className="cake-detail-total">Total<span aria-live="polite">{formatPrice(unitPrice * quantity)}</span></p></div>
          <div className="cake-detail-purchase"><button className="button catalog-secondary-button" disabled={!product.available} onClick={() => onAdd?.(product, options)}><ShoppingBag size={18} aria-hidden="true" />Add to cart</button><button className="button catalog-primary-button" disabled={!product.available} onClick={() => onBuy?.(product, options)}>Buy now<ArrowRight size={18} aria-hidden="true" /></button></div>
          <p className="cake-detail-order-note">Your selected weight and flavour will be included in your order review.</p>
          <div className="cake-detail-small-print"><h2>A little care, a lovely treat.</h2><p>{product.collection === 'cakes' ? 'Keep refrigerated and allow a little time at room temperature before serving. Decorative details may vary.' : product.collection === 'chocolates' ? 'Store in a cool, dry place away from direct sunlight. Decorative details and assortment may vary.' : 'Keep in a cool place and enjoy fresh. Refrigerate syrup-based sweets after opening.'} Please confirm any dietary or allergy requirements before ordering.</p></div>
        </div>
      </div>
    </section>
    <section className="catalog-related" aria-labelledby="cake-related-title"><div className="container"><div className="catalog-section-heading"><div><p className="eyebrow">A FEW MORE FAVOURITES</p><h2 id="cake-related-title">You might also love.</h2></div><Link to={fallback} className="catalog-details-link">View collection<ArrowRight size={16} /></Link></div><div className="catalog-product-grid">{recommendations.map((item) => <CatalogProductCard key={item.id} product={item} onAdd={onAdd} onBuy={onBuy} />)}</div></div></section>
  </div>
}
