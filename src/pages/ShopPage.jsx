import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, ChevronRight, Search, ShoppingBag, Wheat, X } from 'lucide-react'
import { categories } from '../data/categories'
import { products } from '../data/products'
import ShopProductCard from '../components/ShopProductCard'
import '../styles/shop.css'

export default function ShopPage({ onProduct, onAdd, onBasket }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = categories.find((item) => item.name.toLowerCase() === searchParams.get('category')?.toLowerCase())?.name || 'All'
  const query = searchParams.get('q') || ''
  const sort = ['name-asc', 'name-desc'].includes(searchParams.get('sort')) ? searchParams.get('sort') : 'featured'
  const shown = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const matching = products.filter((product) => (category === 'All' || product.category === category) && `${product.name} ${product.category} ${product.note} ${product.description}`.toLowerCase().includes(normalized))
    if (sort !== 'featured') matching.sort((a, b) => (sort === 'name-asc' ? 1 : -1) * a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
    return matching
  }, [category, query, sort])
  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'All' || value === 'featured') next.delete(key)
    else next.set(key, key === 'category' ? value.toLowerCase() : value)
    setSearchParams(next, { replace: key === 'q', preventScrollReset: true })
  }
  function reset() { setSearchParams({}, { preventScrollReset: true }) }
  const filtered = category !== 'All' || Boolean(query.trim())
  return <div className="shop-page">
    <section className="shop-hero" aria-labelledby="shop-title">
      <img className="shop-hero-photo" src="/images/bakery/hero/hero-fresh-croissant.webp" alt="Two golden croissants with delicate, buttery layers on a dark background" width="2400" height="1600" fetchPriority="high" />
      <div className="shop-hero-shade" />
      <div className="container shop-hero-content"><div className="shop-hero-copy">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">Shop</span></nav>
        <p className="eyebrow">BAKED TO BE LOVED</p>
        <h1 id="shop-title">The Bakery<br />Collection<span>.</span></h1>
        <p className="shop-hero-description">A daily loaf. A buttery layer.<br />A little something just for you.</p>
      </div></div>
    </section>

    <section className="shop-collection" aria-labelledby="collection-title" id="bakery-collection"><div className="container">
      <div className="shop-collection-heading"><div><p className="eyebrow">FIND YOUR EVERYDAY FAVORITE</p><h2 id="collection-title">Our bakes</h2></div>
        <form className="shop-search" role="search" onSubmit={(event) => event.preventDefault()}><Search size={20} strokeWidth={1.5} aria-hidden="true" /><label className="sr-only" htmlFor="shop-search">Search the collection</label><input id="shop-search" name="q" type="search" placeholder="Find your favorite bake…" value={query} onChange={(event) => updateFilter('q', event.target.value)} autoComplete="off" maxLength={120} />{query && <button type="button" className="icon-button" onClick={() => updateFilter('q', '')} aria-label="Clear collection search"><X size={18} /></button>}</form>
      </div>
      <div className="shop-category-tabs" role="group" aria-label="Bakery categories">{['All', ...categories.map((item) => item.name)].map((name) => <button key={name} className={category === name ? 'is-selected' : ''} aria-label={name === 'All' ? 'All bakes' : name} aria-pressed={category === name} onClick={() => updateFilter('category', name)}><span>{name === 'All' ? 'All bakes' : name}</span><span className="shop-category-count" aria-hidden="true">{name === 'All' ? products.length : products.filter((product) => product.category === name).length}</span></button>)}</div>
      <div className="shop-toolbar"><p className="shop-results-count" role="status">{shown.length} {shown.length === 1 ? 'bake' : 'bakes'}{category !== 'All' ? ` in ${category.toLowerCase()}` : ' to discover'}{query.trim() ? ` matching “${query.trim()}”` : ''}</p><div className="shop-sort"><label htmlFor="shop-sort">Sort by</label><select id="shop-sort" value={sort} onChange={(event) => updateFilter('sort', event.target.value)}><option value="featured">Featured</option><option value="name-asc">Name, A–Z</option><option value="name-desc">Name, Z–A</option></select></div></div>
      {filtered && <div className="shop-active-filters"><span>Your selection</span>{category !== 'All' && <button onClick={() => updateFilter('category', 'All')} aria-label={`Remove ${category} filter`}>{category}<X size={14} aria-hidden="true" /></button>}{query.trim() && <button onClick={() => updateFilter('q', '')} aria-label="Remove search filter"><span>“{query.trim()}”</span><X size={14} aria-hidden="true" /></button>}<button className="shop-clear-filters" onClick={reset}>Clear all</button></div>}
      {shown.length ? <div className="shop-product-grid">{shown.map((product) => <ShopProductCard key={product.id} product={product} onOpen={onProduct} onAdd={onAdd} />)}</div> : <div className="shop-empty"><Wheat size={48} strokeWidth={1} aria-hidden="true" /><h3>No bakes found this time.</h3><p>Try another search or browse the whole collection.<br />There’s a little goodness waiting to be discovered.</p><button className="button button--gold" onClick={reset}>Explore all bakes<ArrowRight size={18} /></button></div>}
      <div className="shop-collection-footer"><p><span>Thoughtfully made. Joyfully shared.</span>Collection preview · pricing and ordering details are coming soon.</p><button className="text-link" onClick={onBasket}>View my basket<ShoppingBag size={19} strokeWidth={1.5} /></button></div>
    </div></section>
  </div>
}
