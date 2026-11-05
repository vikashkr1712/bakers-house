import { ArrowUpRight, Plus } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { formatPrice, getUnitPrice } from '../data/catalog'
import '../styles/catalog.css'

export default function CatalogProductCard({ product, onAdd, onBuy }) {
  const location = useLocation()
  const options = { weight: product.weights[0].label, flavour: product.flavours[0], quantity: 1 }
  const from = `${location.pathname}${location.search}`
  return <article className="catalog-product-card">
    <div className="catalog-product-image">
      <Link to={product.detailPath} state={{ from }} aria-label={`View details of ${product.name}`}>
        <img src={product.image} alt={product.alt} width="800" height="800" loading="lazy" decoding="async" />
      </Link>
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
