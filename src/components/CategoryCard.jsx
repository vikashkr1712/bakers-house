import { ArrowUpRight } from 'lucide-react'

export default function CategoryCard({ category, onOpen }) {
  return <button className="category-card group" onClick={() => onOpen(category.name)} aria-label={`Explore ${category.name.toLowerCase()}`}>
    <span className="category-image-wrap"><img src={category.image} alt={category.alt} width="640" height="720" loading="lazy" decoding="async" /><span className="category-image-shade" /><span className="category-card-title">{category.name}<ArrowUpRight size={22} strokeWidth={1.5} /></span></span>
    <span className="category-caption">{category.description}</span>
  </button>
}
