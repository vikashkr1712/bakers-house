import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, ArrowDown, CornerDownRight } from 'lucide-react'

const compositions = [
  { label: 'Breads', eyebrow: 'ARTISAN BAKERY', title: <>Freshly Baked,<br />Artisan Crafted<span>.</span></>, description: 'Handcrafted breads and pastries. Fine ingredients, time-honored traditions, and a little love in every bake.', image: '/images/bakery/hero/hero-artisan-bread.webp', alt: 'Rustic artisan bread, baked to a beautiful golden crust', button: 'Shop Bakery', category: 'All' },
  { label: 'Pastries', eyebrow: 'THE ART OF THE EVERYDAY', title: <>Delicate Layers,<br />Simple Pleasures<span>.</span></>, description: 'Golden, buttery, beautifully flaky. Discover the little things that make an ordinary morning feel special.', image: '/images/bakery/hero/hero-fresh-croissant.webp', alt: 'Golden croissants with crisp, delicate layers', button: 'Explore pastries', category: 'Pastries' },
  { label: 'Cakes', eyebrow: 'A LITTLE REASON TO CELEBRATE', title: <>Made for Sharing,<br />Baked with Care<span>.</span></>, description: 'Something sweet for the moments that matter. Thoughtfully crafted cakes, from the first slice to the last.', image: '/images/bakery/hero/hero-chocolate-cake.webp', alt: 'A rich chocolate cake ready to be shared', button: 'Discover our cakes', category: 'Cakes' },
]

export default function Hero({ onShop }) {
  const [selected, setSelected] = useState(0)
  const reduced = useReducedMotion()
  const composition = compositions[selected]
  return <section className={`hero hero--${selected}`} id="home" aria-label="Welcome to Baker’s House">
    <div className="hero-photograph" aria-hidden="true"><AnimatePresence mode="sync" initial={false}><motion.img key={composition.image} src={composition.image} alt="" width="2400" height="1600" fetchPriority={selected === 0 ? 'high' : 'auto'} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }} /></AnimatePresence></div>
    <div className="hero-shade" />
    <div className="container hero-content">
      <AnimatePresence mode="wait" initial={true}><motion.div key={selected} className="hero-copy" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
        <p className="eyebrow">{composition.eyebrow}</p>
        <h1>{composition.title}</h1>
        <p className="hero-description">{composition.description}</p>
        <div className="hero-buttons"><button className="button button--gold" onClick={() => onShop(composition.category)}>{composition.button}<ArrowRight size={20} aria-hidden="true" /></button><a className="button button--outline" href="#our-story">Our Story<CornerDownRight size={20} aria-hidden="true" /></a></div>
      </motion.div></AnimatePresence>
      <div className="hero-bottom"><div className="hero-compositions" aria-label="Choose a featured collection">{compositions.map((item, index) => <button key={item.label} className={selected === index ? 'is-selected' : ''} onClick={() => setSelected(index)} aria-pressed={selected === index}><span>0{index + 1}</span>{item.label}</button>)}</div><a className="hero-scroll" href="#categories" aria-label="Scroll to explore our bakery"><span>SCROLL TO EXPLORE</span><ArrowDown size={16} /></a></div>
    </div>
  </section>
}
