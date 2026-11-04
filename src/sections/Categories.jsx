import { categories } from '../data/categories'
import SectionHeading from '../components/SectionHeading'
import CategoryCard from '../components/CategoryCard'
import Reveal from '../components/Reveal'

export default function Categories({ onShop }) {
  return <section className="section section--cream categories" id="categories"><div className="container"><Reveal><SectionHeading eyebrow="SOMETHING FOR EVERY CRAVING" title="Explore Our Bakery" description="From your daily loaf to your favorite little indulgence." /></Reveal><div className="category-grid">{categories.map((category, index) => <Reveal key={category.name} delay={index * 0.06}><CategoryCard category={category} onOpen={onShop} /></Reveal>)}</div></div></section>
}
