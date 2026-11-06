import { ArrowDown, ArrowRight, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { chocolateProducts, sweetProducts } from '../data/catalog'
import CatalogProductCard from '../components/CatalogProductCard'
import SubcategoryFilters from '../components/SubcategoryFilters'
import { getSubcategory, getSweetType, matchesSubcategory, resolveSweetCollection } from '../data/subcategories'
import '../styles/catalog.css'

const collections = {
  chocolates: { name: 'Chocolates', eyebrow: 'A LITTLE EVERYDAY INDULGENCE', title: 'Little Luxuries.', emphasis: 'Lovely Moments.', description: 'Rich truffles, delicate pralines and thoughtful little gifts. Find a chocolate worth taking your time over.', image: '/images/bakery/redesign/chocolate-pralines.webp', alt: 'Assorted chocolate pralines decorated with nuts and toppings', caption: 'Little bites,', captionEmphasis: 'lasting smiles.', section: 'The chocolate collection.', products: chocolateProducts },
  sweets: { name: 'Sweets', eyebrow: 'SWEETNESS, SHARED WITH LOVE', title: 'A Taste Of', emphasis: 'Togetherness.', description: 'Familiar favourites for festive tables, thoughtful gifts and the everyday joy of sharing something sweet.', image: '/images/bakery/redesign/sweet-kaju-katli.webp', alt: 'Diamond-cut kaju katli with silver leaf on a golden plate', caption: 'Sweet traditions,', captionEmphasis: 'new memories.', section: 'The sweets collection.', products: sweetProducts },
}

export default function CollectionPage({ collection = 'chocolates', onAdd, onBuy }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const current = collections[collection] || collections.chocolates
  const collectionId = collections[collection] ? collection : 'chocolates'
  const mithai = collectionId === 'sweets' ? resolveSweetCollection(searchParams.get('mithai'), searchParams.get('subcategory'), searchParams.get('type')) : null
  const subcategory = getSubcategory(collectionId, searchParams.get('subcategory'), mithai)
  const sweetType = getSweetType(collectionId, searchParams.get('subcategory'), searchParams.get('type'), mithai)
  const shown = current.products.filter(product => matchesSubcategory(product, subcategory, sweetType, mithai)).sort((a, b) => a.bestsellerRank - b.bestsellerRank)
  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (subcategory) next.set('subcategory', subcategory.id)
    if (sweetType) next.set('type', sweetType.id)
    if (key === 'mithai') {
      next.delete('subcategory')
      next.delete('type')
    } else if (mithai) next.set('mithai', mithai.id)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key === 'subcategory') next.delete('type')
    setSearchParams(next, { preventScrollReset: true })
  }
  function viewResults() {
    const results = document.getElementById('collection-results')
    results?.focus({ preventScroll: true })
    results?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
  return <div className={`catalog-page confection-page confection-page--${collection}`}>
    <section className="catalog-hero" aria-labelledby="collection-page-title"><div className="container catalog-hero-layout">
      <div className="catalog-hero-copy">
        <nav className="catalog-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">{current.name}</span></nav>
        <p className="eyebrow">{current.eyebrow}</p><h1 id="collection-page-title">{current.title} <em>{current.emphasis}</em></h1><p className="catalog-hero-description">{current.description}</p>
        <div className="catalog-hero-actions"><a href="#confection-products" className="button catalog-primary-button">Explore {current.name.toLowerCase()}<ArrowDown size={18} aria-hidden="true" /></a><Link className="catalog-hero-secondary" to="/cakes">Explore our cakes<ArrowRight size={16} aria-hidden="true" /></Link></div>
        <div className="catalog-hero-footnote"><span aria-hidden="true" /><p>Something lovely for someone special.</p></div>
      </div>
      <div className="catalog-hero-visual"><div className="catalog-hero-photo-frame"><img key={current.image} src={current.image} alt={current.alt} width="1000" height="1000" fetchPriority="high" /></div><div className="catalog-hero-caption"><span>THE {current.name.toUpperCase()} COLLECTION</span><p>{current.caption}<br /><em>{current.captionEmphasis}</em></p></div><span className="catalog-hero-seal" aria-hidden="true">A little<br /><em>happiness</em></span></div>
    </div></section>
    <section className="catalog-listing confection-listing" id="confection-products" aria-labelledby="confection-products-title"><div className="container">
      <div className="catalog-section-heading catalog-listing-heading"><div><p className="eyebrow">CHOOSE A LITTLE HAPPINESS</p><h2 id="confection-products-title">{current.section}</h2><p>Discover your favourites, beginning with our best sellers.</p></div></div>
      <div className="collection-subcategory-panel"><div className="collection-filter-caption"><SlidersHorizontal size={18} strokeWidth={1.5} aria-hidden="true" /><span>Find your favourite</span></div><div className="collection-subcategory-controls"><SubcategoryFilters collection={collectionId} mithai={mithai?.id} subcategory={subcategory?.id} sweetType={sweetType?.id} onChange={updateFilter} idPrefix="collection" resultsCount={shown.length} onViewResults={viewResults} /></div></div>
      <p id="collection-results" tabIndex={-1} className="catalog-results-count" role="status" aria-live="polite">{shown.length} sweet discoveries</p>
      <div className="catalog-product-grid">{shown.map((product) => <CatalogProductCard key={product.id} product={product} onAdd={onAdd} onBuy={onBuy} />)}</div>
      <div className="catalog-closing-note"><span className="catalog-note-rule" /><p>A little sweetness goes a long way.</p><span className="catalog-note-rule" /></div>
    </div></section>
  </div>
}
