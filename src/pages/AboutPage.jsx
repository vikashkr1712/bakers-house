import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, ChevronRight, HandHeart, Leaf, Wheat } from 'lucide-react'
import Reveal from '../components/Reveal'
import '../styles/about.css'

const values = [
  { icon: Leaf, title: 'Simple, thoughtful ingredients', text: 'Good baking starts with the essentials. We’re inspired by familiar ingredients and the wonderful things they can become.' },
  { icon: HandHeart, title: 'A respect for the craft', text: 'The care in a folded layer. The character of a golden crust. It’s the little details that make a bake worth slowing down for.' },
  { icon: Wheat, title: 'Goodness worth sharing', text: 'A loaf on the table or a little something sweet. Our collection celebrates the everyday moments that bring people together.' },
]

const process = [
  { number: '01', title: 'Begin with the essentials', text: 'Flour, water, and a little possibility. Our inspiration starts with simple ingredients and a love for honest flavor.', image: '/images/bakery/categories/category-breads.webp', alt: 'Thick slices of rustic bread with a golden crust' },
  { number: '02', title: 'Give the craft its time', text: 'From a beautifully formed loaf to delicate pastry layers, good baking is a reminder that some things are worth the wait.', image: '/images/bakery/hero/hero-fresh-croissant.webp', alt: 'Golden croissants with delicate, flaky layers' },
  { number: '03', title: 'Make a moment of it', text: 'Slice, pass around, and enjoy. Because a good bake is even better with a warm conversation and a little company.', image: '/images/bakery/categories/category-cakes.webp', alt: 'Little cakes topped with frosting and fresh berries, ready to share' },
]

export default function AboutPage({ onContact }) {
  return <div className="about-page">
    <section className="about-hero" aria-labelledby="about-title">
      <div className="container">
        <nav className="about-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">About us</span></nav>
        <div className="about-hero-grid">
          <div className="about-hero-copy">
            <p className="eyebrow">THE HEART OF BAKER’S HOUSE</p>
            <h1 id="about-title">Simple ingredients.<br />A little more <em>heart.</em></h1>
            <p>A love for traditional baking. A respect for the simple things. And the belief that something good is always better shared.</p>
            <div className="about-hero-actions"><Link className="button button--gold" to="/search">Explore our bakes<ArrowRight size={18} aria-hidden="true" /></Link><Link className="about-philosophy-link" to="/about#about-philosophy">Our philosophy<ArrowDown size={17} aria-hidden="true" /></Link></div>
          </div>
          <figure className="about-hero-visual">
            <img src="/images/bakery/story/story-baker-working.webp" alt="Flour-dusted hands carefully shaping dough on a bakery workbench" width="2000" height="1333" fetchPriority="high" decoding="async" />
            <figcaption><Wheat size={27} strokeWidth={1.1} aria-hidden="true" /><span>Flour. Water. Heart.<small>Inspired by the art of making.</small></span></figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section className="about-philosophy" id="about-philosophy" aria-labelledby="about-philosophy-title">
      <div className="container">
        <div className="about-philosophy-grid">
          <Reveal className="about-philosophy-heading" direction="left"><p className="eyebrow">OUR PHILOSOPHY</p><h2 id="about-philosophy-title">Good things take<br />a little <em>time.</em></h2><span className="short-rule" /><p className="about-signature">Thoughtfully made. Joyfully shared.</p></Reveal>
          <Reveal className="about-philosophy-copy" direction="right" delay={0.1}><p>There is something quietly wonderful about baking. The feel of dough beneath your hands. The first crackle of a crust. A buttery flake that makes an ordinary morning feel special.</p><p>Baker’s House is inspired by those simple pleasures. Our collection brings together rustic breads, delicate pastries, comforting cookies, and cakes made for a moment of celebration.</p><p>At its heart is a simple idea: make room for the things that matter. Good food, a little patience, and the people around your table.</p></Reveal>
        </div>
        <div className="about-values-grid">{values.map(({ icon: Icon, title, text }, index) => <Reveal className="about-value" key={title} delay={index * 0.08}><Icon size={30} strokeWidth={1.2} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></Reveal>)}</div>
      </div>
    </section>

    <section className="about-craft" aria-labelledby="about-craft-title">
      <div className="container">
        <div className="about-section-heading"><Reveal direction="left"><p className="eyebrow">THE BEAUTY IS IN THE MAKING</p><h2 id="about-craft-title">A little patience.<br />A lot of care.</h2></Reveal><Reveal direction="right"><p>From the first handful of flour to the last crumb on the plate, it’s the care along the way that inspires us.</p></Reveal></div>
        <div className="about-process-grid">{process.map((step, index) => <article className="about-process-step" key={step.number}><Reveal className="about-process-photo" delay={index * 0.08}><img src={step.image} alt={step.alt} width="1000" height="700" loading="lazy" decoding="async" /></Reveal><Reveal className="about-process-copy" delay={index * 0.08 + 0.08}><p className="about-step-number"><span>{step.number}</span><span aria-hidden="true" /></p><h3>{step.title}</h3><p>{step.text}</p></Reveal></article>)}</div>
      </div>
    </section>

    <section className="about-invitation" aria-labelledby="about-invitation-title">
      <div className="container about-invitation-grid">
        <Reveal className="about-invitation-photo" direction="left"><img src="/images/bakery/banners/banner-fresh-pastries.webp" alt="Golden filled croissants on a wooden board, with a basket of pastries behind them" width="1200" height="822" loading="lazy" decoding="async" /></Reveal>
        <Reveal className="about-invitation-copy" direction="right" delay={0.1}><p className="eyebrow">A PLACE FOR SIMPLE PLEASURES</p><h2 id="about-invitation-title">For the everyday.<br />And the <em>just because.</em></h2><p>A daily loaf. A coffee-break companion. Something sweet for someone you love. Find a little goodness for whatever the day brings.</p><div className="about-invitation-actions"><Link className="button button--gold" to="/search">Explore our bakes<ArrowRight size={18} aria-hidden="true" /></Link><button className="text-link" onClick={onContact}>Get in touch<ArrowRight size={17} aria-hidden="true" /></button></div></Reveal>
      </div>
    </section>
  </div>
}
