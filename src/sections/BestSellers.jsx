import { ArrowRight } from 'lucide-react'
import { featuredProducts } from '../data/products'
import SectionHeading from '../components/SectionHeading'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'

export default function BestSellers({ onShop, onProduct, onAdd }) {
  return <section className="section section--cream favorites" id="shop"><div className="container"><Reveal direction="right"><SectionHeading eyebrow="BAKED TO BE LOVED" title="Customer Favorites" align="left" description="Meet a few of the bakes that make a day better."><button className="text-link" onClick={() => onShop('All')}>View all bakes<ArrowRight size={17} /></button></SectionHeading></Reveal><div className="product-grid">{featuredProducts.map((product, index) => <Reveal key={product.id} direction="left" delay={index * 0.08}><ProductCard product={product} onOpen={onProduct} onAdd={onAdd} /></Reveal>)}</div><p className="collection-note">Explore our collection. Pricing and ordering details are coming soon.</p></div></section>
}
