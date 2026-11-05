import { categories } from '../data/categories'
import SectionHeading from '../components/SectionHeading'
import CategoryCard from '../components/CategoryCard'
import Reveal from '../components/Reveal'

export default function Categories({ onShop }) {
  return <section className="section section--cream categories" id="categories"><div className="container"><Reveal direction="right"><SectionHeading eyebrow="SOMETHING FOR EVERY CRAVING" title="Explore Our Collections" description="Celebration cakes, thoughtful chocolates and a little taste of tradition." /></Reveal><div className="category-grid">{categories.map((category, index) => <CategoryCard key={category.name} category={category} onOpen={onShop} delay={index * 0.08} />)}</div></div></section>
}
