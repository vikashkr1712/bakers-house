import { ArrowRight } from 'lucide-react'
import { featuredProducts } from '../data/products'
import SectionHeading from '../components/SectionHeading'
import CatalogProductCard from '../components/CatalogProductCard'
import Reveal from '../components/Reveal'

const homeFavourites = ['cakes', 'chocolates', 'sweets'].map(collection => featuredProducts.find(product => product.collection === collection)).filter(Boolean)

export default function BestSellers({ onShop, onAdd, onBuy }) {
  return <section className="section section--cream favorites" id="shop"><div className="container"><Reveal direction="right"><SectionHeading eyebrow="SWEET REASONS TO CELEBRATE" title="Best Sellers" align="left" description="A few favourites for your next sweet moment."><button className="text-link" onClick={() => onShop('Cakes & Pastries')}>Explore our cakes<ArrowRight size={17} /></button></SectionHeading></Reveal><div className="product-grid">{homeFavourites.map((product, index) => <Reveal key={product.id} direction="left" delay={index * 0.08}><CatalogProductCard product={product} onAdd={onAdd} onBuy={onBuy} /></Reveal>)}</div></div></section>
}
