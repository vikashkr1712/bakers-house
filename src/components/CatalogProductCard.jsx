import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { formatPrice, getUnitPrice } from '../data/catalog'
import '../styles/catalog.css'
import '../styles/product-gallery.css'

export default function CatalogProductCard({ product, onAdd, onBuy }) {
  const location = useLocation()
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [activeImage, setActiveImage] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const [inView, setInView] = useState(false)
  const cardRef = useRef(null)
  const gallery = product.gallery || [{ src: product.image, alt: product.alt, generated: false }]
  const previewEnabled = location.pathname.replace(/\/+$/, '') === '/shop' && gallery.length > 1
  const currentPhoto = gallery[previewEnabled ? activeImage : 0] || gallery[0]
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      setReducedMotion(media.matches)
    }
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (!previewEnabled) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [previewEnabled])
  useEffect(() => {
    if (!previewEnabled || !inView || !autoplay || reducedMotion) return
    const timer = window.setInterval(() => {
      if (!document.hidden) setActiveImage(index => (index + 1) % gallery.length)
    }, 4000)
    return () => window.clearInterval(timer)
  }, [autoplay, gallery.length, inView, previewEnabled, reducedMotion])
  useEffect(() => {
    if (!previewEnabled || !inView || !autoplay || reducedMotion) return
    const next = new Image()
    next.src = gallery[(activeImage + 1) % gallery.length].src
  }, [activeImage, autoplay, gallery, inView, previewEnabled, reducedMotion])
  function changePhoto(direction) {
    setAutoplay(false)
    setActiveImage(index => (index + direction + gallery.length) % gallery.length)
  }
  const options = { weight: product.weights[0].label, flavour: product.flavours[0], quantity: 1 }
  const from = `${location.pathname}${location.search}`
  return <article ref={cardRef} className="catalog-product-card" onPointerLeave={() => { if (!cardRef.current.contains(document.activeElement)) setAutoplay(true) }} onFocusCapture={() => setAutoplay(false)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setAutoplay(true) }}>
    <div className="catalog-product-image">
      <Link to={product.detailPath} state={{ from }} aria-label={`View details of ${product.name}`}>
        <img key={currentPhoto.src} src={currentPhoto.src} alt={currentPhoto.alt} width="800" height="800" loading="lazy" decoding="async" />
      </Link>
      {previewEnabled && <>
        {currentPhoto.generated && <span className="catalog-preview-sample">Generated sample</span>}
        <button type="button" className="catalog-preview-arrow catalog-preview-arrow--previous" aria-label={`Previous photograph of ${product.name}`} onClick={() => changePhoto(-1)}><ChevronLeft size={18} aria-hidden="true" /></button>
        <button type="button" className="catalog-preview-arrow catalog-preview-arrow--next" aria-label={`Next photograph of ${product.name}`} onClick={() => changePhoto(1)}><ChevronRight size={18} aria-hidden="true" /></button>
        <span className="catalog-gallery-position" aria-live={autoplay && !reducedMotion ? 'off' : 'polite'}>{activeImage + 1} / {gallery.length}</span>
      </>}
      {product.bestseller && <span className="catalog-bestseller">Best seller</span>}
      {!product.available && <span className="catalog-unavailable">Currently unavailable</span>}
      {onAdd && <button className="catalog-quick-add" onClick={() => onAdd(product, options)} disabled={!product.available} aria-label={`Add ${product.name} to cart`}><Plus size={20} strokeWidth={1.5} /></button>}
    </div>
    <div className="catalog-product-info">
      <div className="catalog-product-tags">{product.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <h3><Link to={product.detailPath} state={{ from }}>{product.name}</Link></h3>
      <p className="catalog-product-note">{product.note}</p>
      <p className="catalog-product-price"><span>From</span> {formatPrice(getUnitPrice(product, options.weight))}<small>/ {options.weight}</small></p>
      <div className="catalog-product-actions">
        <Link to={product.detailPath} state={{ from }} className="catalog-details-link">View details<ArrowUpRight size={16} aria-hidden="true" /></Link>
        <button className="catalog-buy-button" disabled={!product.available} onClick={() => onBuy?.(product, options)}>{product.available ? 'Buy now' : 'Unavailable'}</button>
      </div>
    </div>
  </article>
}
