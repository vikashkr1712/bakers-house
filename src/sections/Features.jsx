import { Leaf, HandHeart, Award } from 'lucide-react'
import Reveal from '../components/Reveal'

const benefits = [
  { icon: Leaf, title: 'Natural Ingredients', text: 'Good things, thoughtfully chosen.' },
  { icon: HandHeart, title: 'Artisan Made', text: 'A little patience. A lot of care.' },
  { icon: Award, title: 'Premium Quality', text: 'The simple things, done well.' },
]

export default function Features() {
  return <section className="features" id="about" aria-label="Our baking philosophy"><div className="container features-inner">{benefits.map(({ icon: Icon, title, text }, index) => <div className="feature" key={title}><Reveal className="feature-icon" direction="left" delay={index * 0.06} observeParent><Icon size={31} strokeWidth={1.2} aria-hidden="true" /></Reveal><Reveal direction="right" delay={index * 0.06 + 0.06} observeParent><h2>{title}</h2><p>{text}</p></Reveal></div>)}</div></section>
}
