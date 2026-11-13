import { ArrowRight } from 'lucide-react'
import Reveal from '../components/Reveal'
import { cakePhotos } from '../data/cakePhotos'

export default function PromotionalBanner({ onShop }) {
  return <section className="promotional-banner" aria-labelledby="fresh-bakes-title">
    <div className="container banner-layout">
      <Reveal className="banner-copy" direction="right" delay={0.1}>
        <p className="eyebrow">A LITTLE EVERYDAY JOY</p>
        <h2 id="fresh-bakes-title">Fresh Bakes,<br />Every Day<span>.</span></h2>
        <p>Made with care. Best enjoyed together.</p>
        <button className="button button--gold" onClick={() => onShop('All')}>Explore the collection<ArrowRight size={17} /></button>
      </Reveal>
      <div className="banner-image-frame"><Reveal className="banner-visual" direction="left" observeParent><img className="banner-photo" src={cakePhotos.pinkRosette.src} alt={cakePhotos.pinkRosette.alt} width={cakePhotos.pinkRosette.width} height={cakePhotos.pinkRosette.height} loading="lazy" decoding="async" /></Reveal></div>
    </div>
  </section>
}
