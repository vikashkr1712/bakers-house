import { ArrowUpRight, Plus } from 'lucide-react'

export default function ProductCard({ product, onOpen, onAdd, compact = false }) {
  return <article className={`product-card ${compact ? 'product-card--compact' : ''}`}>
    <div className="product-image-wrap"><button className="product-image-button" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}><img src={product.image} alt={product.alt} width="640" height="720" loading="lazy" decoding="async" /><span className="product-view">Discover <ArrowUpRight size={15} /></span></button><button className="product-add" onClick={() => onAdd(product)} aria-label={`Add ${product.name} to basket`}><Plus size={19} strokeWidth={1.5} /></button></div>
    <div className="product-info"><p className="product-category">{product.category}</p><button className="product-name" onClick={() => onOpen(product)}>{product.name}</button><p className="product-note">{product.note}</p></div>
  </article>
}
