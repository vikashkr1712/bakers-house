import { ArrowDown, ArrowRight, Check, ChevronRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { cakeCategories, cakeProducts } from '../data/catalog'
import CatalogProductCard from '../components/CatalogProductCard'
import '../styles/catalog.css'

function showProducts() {
  requestAnimationFrame(() => document.getElementById('cake-products')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }))
}

export default function CakesPage({ onAdd, onBuy }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = (searchParams.get('category') || '').toLowerCase().trim()
  const selected = cakeCategories.find((category) => category.id === requested || category.name.toLowerCase() === requested)
  const shown = cakeProducts
    .filter((product) => !selected || product.tags.includes(selected.name))
    .sort((first, second) => first.bestsellerRank - second.bestsellerRank)

  function chooseCategory(category) {
    const next = new URLSearchParams(searchParams)
    if (category) next.set('category', category.id)
    else next.delete('category')
    setSearchParams(next, { preventScrollReset: true })
    showProducts()
  }

  return <div className="catalog-page cakes-page">
    <section className="catalog-hero" aria-labelledby="cake-page-title">
      <div className="container catalog-hero-layout">
        <div className="catalog-hero-copy">
          <nav className="catalog-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">Cakes &amp; Pastries</span></nav>
          <p className="eyebrow">MAKE A MOMENT OF IT</p>
          <h1 id="cake-page-title">A Cake For Every <em>Celebration.</em></h1>
          <p className="catalog-hero-description">Big milestones. Little wishes. Find a beautiful cake for all the moments that deserve something sweet.</p>
          <div className="catalog-hero-actions"><a className="button catalog-primary-button" href="#cake-products">Explore our cakes<ArrowRight size={18} aria-hidden="true" /></a><button className="catalog-hero-secondary" onClick={() => chooseCategory(null)}>View best sellers<ArrowDown size={16} aria-hidden="true" /></button></div>
          <div className="catalog-hero-footnote"><span aria-hidden="true" /><p>A little happiness, made to share.</p></div>
        </div>
        <div className="catalog-hero-visual">
          <div className="catalog-hero-photo-frame"><img src="/images/bakery/redesign/cake-strawberry.webp" alt="Pink strawberry cream cake topped with a strawberry and red sauce" width="1000" height="667" fetchPriority="high" /></div>
          <div className="catalog-hero-caption"><span>THE CAKE COLLECTION</span><p>Every slice,<br /><em>a sweet memory.</em></p></div>
          <span className="catalog-hero-seal" aria-hidden="true">Made for<br /><em>your moment</em></span>
        </div>
      </div>
    </section>

    <section className="cake-occasions" aria-labelledby="cake-occasions-title"><div className="container">
      <div className="catalog-section-heading"><div><p className="eyebrow">WHAT ARE WE CELEBRATING?</p><h2 id="cake-occasions-title">Find your occasion.</h2></div><button className={`catalog-all-filter ${!selected ? 'is-selected' : ''}`} aria-pressed={!selected} onClick={() => chooseCategory(null)}>All cakes{!selected && <Check size={15} aria-hidden="true" />}</button></div>
      <div className="cake-occasion-grid">{cakeCategories.map((category) => <button key={category.id} className={`cake-occasion-card ${selected?.id === category.id ? 'is-selected' : ''}`} aria-label={category.name} aria-pressed={selected?.id === category.id} onClick={() => chooseCategory(category)}>
        <span className="cake-occasion-image"><img src={category.image} alt={category.alt} width="500" height="500" loading="lazy" decoding="async" />{selected?.id === category.id && <span className="cake-occasion-check"><Check size={17} aria-hidden="true" /></span>}</span>
        <span className="cake-occasion-name">{category.name}<ArrowRight size={16} aria-hidden="true" /></span>
      </button>)}</div>
    </div></section>

    <section className="catalog-listing" id="cake-products" aria-labelledby="cake-products-title"><div className="container">
      <div className="catalog-section-heading catalog-listing-heading"><div><p className="eyebrow">A SLICE OF SOMETHING SPECIAL</p><h2 id="cake-products-title">{selected ? selected.heading : 'Our cake favourites.'}</h2><p>{selected ? `Something lovely for your ${selected.id === 'kids' ? 'little one' : 'celebration'}.` : 'A little of every celebration, beginning with our best sellers.'}</p></div><p className="catalog-results-count" role="status" aria-live="polite">{shown.length} {shown.length === 1 ? 'cake' : 'cakes'}{selected ? ' in your selection' : ' to discover'}</p></div>
      {selected && <div className="catalog-current-filter"><span>{selected.name}</span><button onClick={() => chooseCategory(null)}>Show all cakes<ArrowRight size={15} aria-hidden="true" /></button></div>}
      <div className="catalog-product-grid">{shown.map((product) => <CatalogProductCard key={product.id} product={product} onAdd={onAdd} onBuy={onBuy} />)}</div>
      <div className="catalog-closing-note"><span className="catalog-note-rule" /><p>Choose your cake. Make it your moment.</p><span className="catalog-note-rule" /></div>
    </div></section>
  </div>
}
