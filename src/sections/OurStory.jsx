import { ArrowRight } from 'lucide-react'
import Reveal from '../components/Reveal'

export default function OurStory({ onDiscover }) {
  return <section className="our-story" id="our-story"><div className="container story-grid"><Reveal className="story-image" direction="left"><img src="/images/bakery/story/story-baker-working.webp" alt="A baker working dough by hand at a flour-dusted workbench" width="1200" height="1000" loading="lazy" decoding="async" /><span className="story-image-caption">Good things take time.</span></Reveal><Reveal className="story-copy" direction="right" delay={0.1}><p className="eyebrow">FLOUR. WATER. HEART.</p><h2>The Baker’s<br />House Story<span>.</span></h2><span className="short-rule" /><p>A neighborhood bakery inspired by a love for traditional baking. Where simple ingredients become something a little extraordinary.</p><p>Every loaf and pastry is prepared with care, a respect for the craft, and the belief that good food brings us together.</p><button className="text-link text-link--light" onClick={onDiscover}>Discover our story<ArrowRight size={18} /></button></Reveal></div></section>
}
