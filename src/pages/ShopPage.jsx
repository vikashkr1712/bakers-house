import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigationType, useSearchParams } from 'react-router-dom'
import { ArrowRight, ChevronRight, Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react'
import { cakeCategories, catalogProducts, getUnitPrice, heroCollections } from '../data/catalog'
import CatalogProductCard from '../components/CatalogProductCard'
import '../styles/shop.css'

const priceRanges = [
  { id: '0-500', name: 'Under ₹500', matches: price => price < 500 },
  { id: '500-900', name: '₹500 – ₹900', matches: price => price >= 500 && price <= 900 },
  { id: '900-plus', name: 'Above ₹900', matches: price => price > 900 },
]
const sorts = ['featured', 'price-asc', 'price-desc', 'name-asc', 'name-desc']
const byName = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
const byBestSeller = (a, b) => Number(b.bestseller) - Number(a.bestseller) || a.bestsellerRank - b.bestsellerRank || byName(a, b)

export default function ShopPage({ onAdd, onBuy }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigationType = useNavigationType()
  const latestParams = useRef(searchParams)
  const focusAfterChange = useRef(null)
  const inputRef = useRef(null)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  useEffect(() => {
    if (navigationType === 'POP' || !location.state?.shopFilters) {
      latestParams.current = searchParams
      setQuery(searchParams.get('q') || '')
    }
  }, [navigationType, searchParams, location.state])
  useEffect(() => {
    const selector = focusAfterChange.current
    if (selector) {
      focusAfterChange.current = null
      document.querySelector(selector)?.focus({ preventScroll: true })
    }
  }, [searchParams])

  const requestedCategory = searchParams.get('category')?.toLowerCase()
  const category = heroCollections.find(item => item.id === requestedCategory || item.name.toLowerCase() === requestedCategory)
  const occasion = category?.id === 'cakes' ? cakeCategories.find(item => item.id === searchParams.get('occasion')) : null
  const priceRange = priceRanges.find(item => item.id === searchParams.get('price'))
  const bestsellersOnly = searchParams.get('bestseller') === '1'
  const sort = sorts.includes(searchParams.get('sort')) ? searchParams.get('sort') : 'featured'
  const shown = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const matching = catalogProducts.filter(product => {
      const text = `${product.name} ${product.category} ${product.tags.join(' ')} ${product.note} ${product.description} ${product.flavours.join(' ')}`.toLowerCase()
      return (!category || product.collection === category.id)
        && (!occasion || product.tags.includes(occasion.name))
        && (!priceRange || priceRange.matches(getUnitPrice(product)))
        && (!bestsellersOnly || product.bestseller)
        && words.every(word => text.includes(word))
    })
    return matching.sort(sort === 'price-asc' ? (a, b) => getUnitPrice(a) - getUnitPrice(b) || byName(a, b)
      : sort === 'price-desc' ? (a, b) => getUnitPrice(b) - getUnitPrice(a) || byName(a, b)
      : sort === 'name-asc' ? byName : sort === 'name-desc' ? (a, b) => byName(b, a) : byBestSeller)
  }, [query, category, occasion, priceRange, bestsellersOnly, sort])

  function updateFilter(key, value) {
    const next = new URLSearchParams(latestParams.current)
    if (!value || value === 'featured') next.delete(key)
    else next.set(key, value)
    if (key === 'q') setQuery(value)
    if (key === 'category' && value !== 'cakes') next.delete('occasion')
    latestParams.current = next
    setSearchParams(next, { replace: key === 'q', preventScrollReset: true, state: { shopFilters: true } })
  }
  function reset() {
    focusAfterChange.current = '#shop-search'
    setQuery('')
    latestParams.current = new URLSearchParams()
    setSearchParams({}, { preventScrollReset: true, state: { shopFilters: true } })
  }
  function removeFilter(key) {
    focusAfterChange.current = { category: '#shop-all-products', occasion: '#shop-occasion', price: '#shop-price', bestseller: '#shop-bestsellers', q: '#shop-search' }[key]
    updateFilter(key, '')
  }
  const activeFilters = [
    ...(category ? [{ key: 'category', label: category.name }] : []),
    ...(occasion ? [{ key: 'occasion', label: occasion.name }] : []),
    ...(priceRange ? [{ key: 'price', label: priceRange.name }] : []),
    ...(bestsellersOnly ? [{ key: 'bestseller', label: 'Best sellers only' }] : []),
    ...(query.trim() ? [{ key: 'q', label: `“${query.trim()}”` }] : []),
  ]

  return <div className="shop-page">
    <section className="shop-intro" aria-labelledby="shop-title"><div className="container">
      <nav className="catalog-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">Shop</span></nav>
      <div className="shop-intro-layout"><div className="shop-intro-copy"><p className="eyebrow">THE BAKER’S HOUSE COLLECTION</p><h1 id="shop-title">Find your <em>sweet spot.</em></h1><p>Cakes to celebrate. Chocolates to gift. Sweets to share.<br className="shop-desktop-break" /> Discover a little of everything you love.</p><Link className="shop-cake-link" to="/cakes">A cake for every occasion<ArrowRight size={17} aria-hidden="true" /></Link></div>
        <div className="shop-collection-previews" aria-label="Explore dedicated collections">{heroCollections.map((collection, index) => <Link to={collection.href} key={collection.id} className={`shop-collection-preview shop-collection-preview--${index}`}><span className="shop-preview-photo"><img src={collection.images[0].src} alt={collection.images[0].alt} width="350" height="400" decoding="async" /></span><span>{collection.name}<ArrowRight size={13} aria-hidden="true" /></span></Link>)}</div>
      </div>
    </div></section>

    <section className="shop-collection" id="bakery-collection" aria-labelledby="collection-title"><div className="container">
      <div className="shop-collection-heading"><div><p className="eyebrow">A LITTLE OF EVERYTHING LOVELY</p><h2 id="collection-title">Shop our favourites.</h2></div><form className="shop-search" role="search" onSubmit={event => event.preventDefault()}><Search size={20} aria-hidden="true" /><label className="sr-only" htmlFor="shop-search">Search shop</label><input ref={inputRef} id="shop-search" name="q" type="search" placeholder="Search cakes, chocolates, sweets…" value={query} onChange={event => updateFilter('q', event.target.value)} onKeyDown={event => { if (event.key === 'Escape' && query) { event.preventDefault(); updateFilter('q', '') } }} maxLength={160} autoComplete="off" />{query && <button className="icon-button" type="button" aria-label="Clear shop search" onClick={() => { updateFilter('q', ''); inputRef.current?.focus() }}><X size={18} aria-hidden="true" /></button>}</form></div>

      <div className="shop-category-tabs" role="group" aria-label="Shop categories"><button id="shop-all-products" aria-label="All products" className={!category ? 'is-selected' : ''} aria-pressed={!category} onClick={() => updateFilter('category', '')}>All products<span aria-hidden="true">{catalogProducts.length}</span></button>{heroCollections.map(item => <button key={item.id} aria-label={item.name} className={category?.id === item.id ? 'is-selected' : ''} aria-pressed={category?.id === item.id} onClick={() => updateFilter('category', item.id)}>{item.name}<span aria-hidden="true">{catalogProducts.filter(product => product.collection === item.id).length}</span></button>)}</div>

      <div className="shop-filter-panel"><div className="shop-filter-caption"><SlidersHorizontal size={18} strokeWidth={1.5} aria-hidden="true" /><span>Find your favourite</span></div><div className="shop-filter-controls">
        <div className="shop-select-field"><label htmlFor="shop-price">Price range</label><select id="shop-price" value={priceRange?.id || ''} onChange={event => updateFilter('price', event.target.value)}><option value="">Any price</option>{priceRanges.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        {category?.id === 'cakes' && <div className="shop-select-field"><label htmlFor="shop-occasion">Cake occasion</label><select id="shop-occasion" value={occasion?.id || ''} onChange={event => updateFilter('occasion', event.target.value)}><option value="">All occasions</option>{cakeCategories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>}
        <label className="shop-bestsellers-filter"><input id="shop-bestsellers" type="checkbox" checked={bestsellersOnly} onChange={event => updateFilter('bestseller', event.target.checked ? '1' : '')} /><span>Best sellers only</span></label>
        {(activeFilters.length > 0 || sort !== 'featured') && <button className="shop-reset" onClick={reset}>Clear all<X size={14} aria-hidden="true" /></button>}
      </div><p className="shop-price-help">Price filters use the starting pack or weight.</p></div>

      <div className="shop-toolbar"><p className="shop-results-count" role="status" aria-live="polite" aria-atomic="true">{shown.length} {shown.length === 1 ? 'product' : 'products'}{category ? ` in ${category.name.toLowerCase()}` : ' to discover'}{query.trim() ? ` matching “${query.trim()}”` : ''}</p><div className="shop-sort"><label htmlFor="shop-sort">Sort by</label><select id="shop-sort" value={sort} onChange={event => updateFilter('sort', event.target.value)}><option value="featured">Best sellers</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name-asc">Name: A–Z</option><option value="name-desc">Name: Z–A</option></select></div></div>
      {activeFilters.length > 0 && <div className="shop-active-filters" aria-label="Active filters">{activeFilters.map(filter => <button key={filter.key} aria-label={`Remove ${filter.key === 'q' ? 'search' : filter.label} filter`} onClick={() => removeFilter(filter.key)}><span>{filter.label}</span><X size={13} aria-hidden="true" /></button>)}</div>}
      {shown.length ? <div className="shop-product-grid">{shown.map(product => <CatalogProductCard key={product.id} product={product} onAdd={onAdd} onBuy={onBuy} />)}</div> : <div className="shop-empty"><Search size={34} strokeWidth={1.3} aria-hidden="true" /><h3>No treats in this selection.</h3><p>Try another search or adjust your filters.<br />There’s something lovely waiting to be found.</p><button className="button button--gold" onClick={reset}>Explore all products<ArrowRight size={18} aria-hidden="true" /></button></div>}
      <div className="shop-collection-footer"><p>Thoughtfully made. Joyfully shared.</p><Link className="text-link" to="/cart">View my basket<ShoppingBag size={18} aria-hidden="true" /></Link></div>
    </div></section>
  </div>
}
