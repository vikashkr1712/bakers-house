import { ArrowRight } from 'lucide-react'
import Reveal from '../components/Reveal'
import { Link } from 'react-router-dom'
import { STORY_PAGE_ENABLED } from '../config/site'
import { cakePhotos } from '../data/cakePhotos'

export default function OurStory() {
  return <section className="our-story" id="our-story"><div className="container story-grid"><Reveal className="story-image" direction="left"><img src={cakePhotos.daisySmile.src} alt={cakePhotos.daisySmile.alt} width={cakePhotos.daisySmile.width} height={cakePhotos.daisySmile.height} loading="lazy" decoding="async" /><span className="story-image-caption">Good things take time.</span></Reveal><Reveal className="story-copy" direction="right" delay={0.1}><p className="eyebrow">FLOUR. CREAM. HEART.</p><h2>The Baker’s<br />House Story<span>.</span></h2><span className="short-rule" /><p>A neighborhood bakery inspired by a love for traditional baking. Where simple ingredients become something a little extraordinary.</p><p>Every cake and sweet treat is prepared with care, a respect for the craft, and the belief that good food brings us together.</p><Link className="text-link text-link--light" to={STORY_PAGE_ENABLED ? '/our-story' : '/'} onClick={() => { if (!STORY_PAGE_ENABLED) window.scrollTo({ top: 0, behavior: 'instant' }) }}>Discover our story<ArrowRight size={18} /></Link></Reveal></div></section>
}
