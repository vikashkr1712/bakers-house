import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, ChevronRight, Wheat } from 'lucide-react'
import Reveal from '../components/Reveal'
import { cakePhotos } from '../data/cakePhotos'
import '../styles/story.css'

const chapters = [
  {
    id: 'story-beginning', number: '01', label: 'THE IDEA', shortLabel: 'The idea',
    title: <>A simple pleasure.<br />A beautiful <em>beginning.</em></>,
    paragraphs: [
      'Baker’s House is inspired by a familiar kind of happiness: a soft sponge, a swirl of cream, and something sweet set in the middle of the table.',
      'Our story lives in those everyday rituals. A love for traditional baking, and the belief that simple food, made thoughtfully, can make an ordinary moment feel special.',
    ],
    photo: cakePhotos.vanillaSmile,
    caption: 'A simple cake. A little happiness.',
  },
  {
    id: 'story-craft', number: '02', label: 'THE CRAFT', shortLabel: 'The craft',
    title: <>There’s beauty in<br />taking your <em>time.</em></>,
    paragraphs: [
      'A soft sponge, smooth cream, a delicate finish. Behind the bakes we love is a craft that asks for patience and attention. Small details, carefully considered.',
      'That respect for the process shapes the collection: celebration cakes, thoughtful chocolates, and traditional sweets for moments worth sharing.',
    ],
    photo: cakePhotos.greenFloral,
    caption: 'A little patience. A lot of care.',
  },
  {
    id: 'story-table', number: '03', label: 'THE TABLE', shortLabel: 'The table',
    title: <>Made for moments.<br />Meant to be <em>shared.</em></>,
    paragraphs: [
      'Food has a way of bringing us closer. A sweet treat passed around the table. A cake cut into generous slices. A small treat saved for someone you love.',
      'This is the spirit of Baker’s House: thoughtful baking, everyday comfort, and a warm invitation to make room for something good. Wherever your table happens to be.',
    ],
    photo: cakePhotos.sunnySmile,
    caption: 'Good food brings us together.',
  },
]

export default function StoryPage({ onContact }) {
  return <div className="story-page">
    <section className="story-page-hero" aria-labelledby="story-page-title">
      <div className="container">
        <nav className="story-page-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">Our story</span></nav>
        <div className="story-page-hero-grid">
          <div className="story-page-intro">
            <p className="eyebrow">THE BAKER’S HOUSE STORY</p>
            <h1 id="story-page-title">Flour. Patience.<br />A little <em>heart.</em></h1>
            <span className="short-rule" aria-hidden="true" />
            <div className="story-page-lede"><p>A celebration of traditional craft, slow mornings, and the simple joy of sharing something good.</p><Link className="button button--gold" to="/our-story#story-beginning">Read our story<ArrowDown size={17} aria-hidden="true" /></Link></div>
          </div>
          <figure className="story-page-hero-photo"><div className="story-page-hero-frame"><img src={cakePhotos.redRosette.src} alt={cakePhotos.redRosette.alt} width={cakePhotos.redRosette.width} height={cakePhotos.redRosette.height} fetchPriority="high" decoding="async" /></div><figcaption><Wheat size={28} strokeWidth={1.1} aria-hidden="true" /><span>Good things take a little time.<small>A little care in every flourish.</small></span></figcaption></figure>
        </div>
        <nav className="story-page-chapter-nav" aria-label="Story chapters">{chapters.map((chapter) => <Link key={chapter.id} to={`/our-story#${chapter.id}`}><span className="story-page-nav-number" aria-hidden="true">{chapter.number}</span><span>{chapter.shortLabel}</span><ArrowDown size={15} aria-hidden="true" /></Link>)}</nav>
      </div>
    </section>

    {chapters.map((chapter, index) => <section className={`story-page-chapter ${index % 2 ? 'story-page-chapter--blush' : ''}`} id={chapter.id} aria-labelledby={`${chapter.id}-title`} key={chapter.id}>
      <div className="container story-page-chapter-grid">
        <Reveal className="story-page-chapter-copy" direction={index % 2 ? 'right' : 'left'}>
          <p className="eyebrow"><span className="story-page-chapter-number" aria-hidden="true">{chapter.number}</span>{chapter.label}</p>
          <h2 id={`${chapter.id}-title`}>{chapter.title}</h2><span className="short-rule" />
          {chapter.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {index === 1 && <p className="story-page-motto">Some things are worth slowing down for.</p>}
        </Reveal>
        <Reveal className="story-page-chapter-visual" direction={index % 2 ? 'left' : 'right'} delay={0.1}>
          <figure><div className="story-page-image-frame"><img src={chapter.photo.src} alt={chapter.photo.alt} width={chapter.photo.width} height={chapter.photo.height} loading="lazy" decoding="async" /></div><figcaption>{chapter.caption}</figcaption></figure>
        </Reveal>
      </div>
    </section>)}

    <section className="story-page-invitation" aria-labelledby="story-page-invitation-title">
      <div className="container"><Reveal className="story-page-invitation-copy"><span className="story-page-invitation-mark"><Wheat size={34} strokeWidth={1.1} aria-hidden="true" /></span><p className="eyebrow">THE NEXT CHAPTER IS YOURS</p><h2 id="story-page-invitation-title">Make room for<br />something <em>good.</em></h2><p>A celebration cake, a little indulgence, or something to share.<br className="story-page-desktop-break" /> Find your own little moment at Baker’s House.</p><div className="story-page-invitation-actions"><Link className="button button--gold" to="/shop">Explore our bakes<ArrowRight size={18} aria-hidden="true" /></Link><button className="text-link" onClick={onContact}>Get in touch<ArrowRight size={17} aria-hidden="true" /></button></div></Reveal></div>
    </section>
  </div>
}
