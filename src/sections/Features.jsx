import { Leaf, HandHeart, Award } from 'lucide-react'

const benefits = [
  { icon: Leaf, title: 'Natural Ingredients', text: 'Good things, thoughtfully chosen.' },
  { icon: HandHeart, title: 'Artisan Made', text: 'A little patience. A lot of care.' },
  { icon: Award, title: 'Premium Quality', text: 'The simple things, done well.' },
]

export default function Features() {
  return <section className="features" id="about" aria-label="Our baking philosophy"><div className="container features-inner">{benefits.map(({ icon: Icon, title, text }) => <div className="feature" key={title}><Icon size={31} strokeWidth={1.2} aria-hidden="true" /><div><h2>{title}</h2><p>{text}</p></div></div>)}</div></section>
}
