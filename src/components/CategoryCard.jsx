import { ArrowUpRight } from 'lucide-react'
import Reveal from './Reveal'

export default function CategoryCard({ category, onOpen, delay = 0 }) {
  return <button className="category-card group" onClick={() => onOpen(category.name)} aria-label={`Explore ${category.name.toLowerCase()}`}>
    <span className="category-image-wrap">
      <Reveal as="span" className="category-photo" direction="left" delay={delay} observeParent><img src={category.image} alt={category.alt} width="640" height="720" loading="lazy" decoding="async" /></Reveal>
      <span className="category-image-shade" />
      <span className="category-card-title"><Reveal as="span" className="category-title-content" direction="right" delay={delay + 0.12} observeParent>{category.name}<ArrowUpRight size={22} strokeWidth={1.5} /></Reveal></span>
    </span>
    <span className="category-caption"><Reveal as="span" className="category-caption-copy" direction="right" delay={delay + 0.18} observeParent>{category.description}</Reveal></span>
  </button>
}
