import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, ArrowDown, CornerDownRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { STORY_PAGE_ENABLED } from '../config/site'
import { heroCollections } from '../data/catalog'

const compositions = [
  { eyebrow: 'BAKED FOR YOUR BEAUTIFUL MOMENTS', title: <>A Little Joy.<br />A Beautiful <em>Celebration.</em></>, description: 'From candle wishes to just-because treats. Discover cakes and pastries made for the moments you love to share.', button: 'Explore our cakes' },
  { eyebrow: 'SMALL BITES. SWEET GESTURES.', title: <>Something Rich.<br />Something <em>Wonderful.</em></>, description: 'A thoughtful gift, a shared indulgence, a moment just for you. Find a little happiness in our chocolate collection.', button: 'Discover chocolates' },
  { eyebrow: 'TRADITION, JOYFULLY SHARED', title: <>Sweet Traditions.<br /><em>New Memories.</em></>, description: 'Bring a little sweetness to your table. Familiar favourites for festive gatherings and everyday moments together.', button: 'Explore our sweets' },
]

const entrances = [{ x: -55, y: -55 }, { x: 65, y: -50 }, { x: 70, y: 35 }, { x: -50, y: 60 }, { x: 30, y: 65 }]

export default function Hero({ onShop }) {
  const [selected, setSelected] = useState(0)
  const reduced = useReducedMotion()
  const composition = compositions[selected]
  const collection = heroCollections[selected]
  return <section className="celebration-hero" id="home" aria-label="Welcome to Baker’s House">
    <div className="container celebration-layout">
      <div className="celebration-copy" key={`copy-${collection.id}`}>
        <p className="eyebrow">{composition.eyebrow}</p>
        <h1>{composition.title}</h1>
        <p className="celebration-description">{composition.description}</p>
        <div className="celebration-actions"><button className="button button--gold" onClick={() => onShop(collection.name)}>{composition.button}<ArrowRight size={20} aria-hidden="true" /></button><Link className="button button--outline" to={STORY_PAGE_ENABLED ? '/our-story' : '/'} onClick={() => { if (!STORY_PAGE_ENABLED) window.scrollTo({ top: 0, behavior: 'instant' }) }}>Our Story<CornerDownRight size={20} aria-hidden="true" /></Link></div>
      </div>
      <div className="celebration-visual" aria-label={`${collection.name} collection photographs`}>
        <span className="celebration-orbit" aria-hidden="true" />
        <span className="celebration-seal" aria-hidden="true">Made for<br /><em>sweet moments</em></span>
        <AnimatePresence mode="sync">{collection.images.map((photo, index) => <motion.div key={`${collection.id}-${index}`} className={`celebration-photo celebration-photo--${index + 1}`} initial={reduced ? false : { opacity: 0, scale: .7, ...entrances[index] }} animate={{ opacity: 1, scale: 1, x: 0, y: 0 }} exit={{ opacity: 0, scale: .9 }} transition={{ duration: reduced ? 0 : .65, delay: reduced ? 0 : index * .15, ease: [.22, 1, .36, 1] }}><div className="celebration-float" style={{ '--float-delay': `${index * -.8}s` }}><img src={photo.src} alt={photo.alt} width="600" height="600" fetchPriority={selected === 0 && index === 0 ? 'high' : 'auto'} decoding="async" /></div></motion.div>)}</AnimatePresence>
      </div>
      <div className="celebration-bottom"><div className="collection-switcher" role="group" aria-label="Choose a featured collection">{heroCollections.map((item, index) => <button key={item.id} className={selected === index ? 'is-selected' : ''} onClick={() => setSelected(index)} aria-pressed={selected === index}><span>0{index + 1}</span>{item.name}</button>)}</div><a className="celebration-scroll" href="#categories" aria-label="Scroll to explore our collections"><span>EXPLORE THE GOODNESS</span><ArrowDown size={16} aria-hidden="true" /></a></div>
    </div>
  </section>
}
