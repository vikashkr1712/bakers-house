import { ArrowUpRight, Plus } from 'lucide-react'

export default function ShopProductCard({ product, onOpen, onAdd }) {
  return <article className="shop-product-card">
    <button className="shop-product-photo" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}>
      <img src={product.image} alt={product.alt} width="640" height="720" loading="lazy" decoding="async" />
      <span className="shop-product-discover">Discover this bake <ArrowUpRight size={18} aria-hidden="true" /></span>
    </button>
    <div className="shop-product-info">
      <p className="shop-product-category">{product.category}</p>
      <h3><button onClick={() => onOpen(product)}>{product.name}</button></h3>
      <p className="shop-product-note">{product.note}</p>
      <button className="shop-product-add" onClick={() => onAdd(product)} aria-label={`Add ${product.name} to basket`}><span>Add<span className="shop-add-extra"> to basket</span></span><Plus size={19} strokeWidth={1.5} aria-hidden="true" /></button>
    </div>
  </article>
}
