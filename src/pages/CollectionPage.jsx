import { ArrowDown, ArrowRight, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { chocolateProducts, sweetProducts } from '../data/catalog'
import CatalogProductCard from '../components/CatalogProductCard'
import '../styles/catalog.css'

const collections = {
  chocolates: { name: 'Chocolates', eyebrow: 'A LITTLE EVERYDAY INDULGENCE', title: 'Little Luxuries.', emphasis: 'Lovely Moments.', description: 'Rich truffles, delicate pralines and thoughtful little gifts. Find a chocolate worth taking your time over.', image: '/images/bakery/redesign/chocolate-pralines.webp', alt: 'Assorted chocolate pralines decorated with nuts and toppings', caption: 'Little bites,', captionEmphasis: 'lasting smiles.', section: 'The chocolate collection.', products: chocolateProducts },
  sweets: { name: 'Sweets', eyebrow: 'SWEETNESS, SHARED WITH LOVE', title: 'A Taste Of', emphasis: 'Togetherness.', description: 'Familiar favourites for festive tables, thoughtful gifts and the everyday joy of sharing something sweet.', image: '/images/bakery/redesign/sweet-kaju-katli.webp', alt: 'Diamond-cut kaju katli with silver leaf on a golden plate', caption: 'Sweet traditions,', captionEmphasis: 'new memories.', section: 'The sweets collection.', products: sweetProducts },
}

export default function CollectionPage({ collection = 'chocolates', onAdd, onBuy }) {
  const current = collections[collection] || collections.chocolates
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
      <div className="catalog-section-heading catalog-listing-heading"><div><p className="eyebrow">CHOOSE A LITTLE HAPPINESS</p><h2 id="confection-products-title">{current.section}</h2><p>Discover your favourites, beginning with our best sellers.</p></div><p className="catalog-results-count" role="status">{current.products.length} sweet discoveries</p></div>
      <div className="catalog-product-grid">{[...current.products].sort((a, b) => a.bestsellerRank - b.bestsellerRank).map((product) => <CatalogProductCard key={product.id} product={product} onAdd={onAdd} onBuy={onBuy} />)}</div>
      <div className="catalog-closing-note"><span className="catalog-note-rule" /><p>A little sweetness goes a long way.</p><span className="catalog-note-rule" /></div>
    </div></section>
  </div>
}
