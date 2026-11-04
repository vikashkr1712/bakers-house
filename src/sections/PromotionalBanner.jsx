import { ArrowRight } from 'lucide-react'
import Reveal from '../components/Reveal'

export default function PromotionalBanner({ onShop }) {
  return <section className="promotional-banner"><img className="banner-photo" src="/images/bakery/banners/banner-fresh-pastries.webp" alt="A tempting selection of freshly baked pastries" width="2000" height="1000" loading="lazy" decoding="async" /><div className="banner-shade" /><Reveal className="container banner-copy"><p className="eyebrow">A LITTLE EVERYDAY JOY</p><h2>Fresh Bakes,<br />Every Day<span>.</span></h2><p>Made with care. Best enjoyed together.</p><button className="button button--gold" onClick={() => onShop('All')}>Explore the collection<ArrowRight size={17} /></button></Reveal></section>
}
