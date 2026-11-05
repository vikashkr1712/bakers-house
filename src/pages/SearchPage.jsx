import { useEffect, useRef, useState } from 'react'
import { Link, useNavigationType, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight, Search, Wheat, X } from 'lucide-react'
import { catalogProducts, heroCollections } from '../data/catalog'
import CatalogProductCard from '../components/CatalogProductCard'
import '../styles/search.css'

export default function SearchPage({ onAdd, onBuy }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigationType = useNavigationType()
  const inputRef = useRef(null)
  const resultsRef = useRef(null)
  const filtersRef = useRef(searchParams)
  const urlQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(urlQuery)
  // Typing must update immediately, outside the router's deferred navigation.
  // Back/forward navigation restores the saved query from the URL.
  useEffect(() => {
    if (navigationType === 'POP') {
      filtersRef.current = searchParams
      setQuery(urlQuery)
    }
  }, [searchParams, urlQuery, navigationType])
  const requestedCategory = searchParams.get('category')?.toLowerCase()
  const category = heroCollections.find((item) => item.name.toLowerCase() === requestedCategory || item.id === requestedCategory)?.name || 'All'
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const filtered = Boolean(words.length) || category !== 'All'
  const results = catalogProducts.filter((product) => {
    const text = `${product.name} ${product.category} ${product.tags.join(' ')} ${product.note} ${product.description} ${product.flavours.join(' ')}`.toLowerCase()
    return (category === 'All' || product.category === category) && words.every((word) => text.includes(word))
  })

  function updateFilter(key, value) {
    const next = new URLSearchParams(filtersRef.current)
    if (key === 'q') setQuery(value)
    else if (query) next.set('q', query)
    else next.delete('q')
    if (!value || (key === 'category' && value === 'All')) next.delete(key)
    else next.set(key, key === 'category' ? value.toLowerCase() : value)
    filtersRef.current = next
    setSearchParams(next, { replace: key === 'q', preventScrollReset: true })
  }
  function clearSearch() {
    updateFilter('q', '')
    inputRef.current?.focus({ preventScroll: true })
  }
  function reset() {
    setQuery('')
    const next = new URLSearchParams()
    filtersRef.current = next
    setSearchParams(next, { preventScrollReset: true })
    inputRef.current?.focus({ preventScroll: true })
  }

  return <div className="search-page">
    <section className="search-page-intro" aria-labelledby="search-title">
      <div className="container">
        <nav className="search-page-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">Search</span></nav>
        <div className="search-page-heading">
          <p className="eyebrow">A LITTLE GOODNESS, JUST A SEARCH AWAY</p>
          <h1 id="search-title">Find your next <em>favorite.</em></h1>
          <p>A celebration cake, a favourite chocolate, or a little taste of tradition.</p>
        </div>
        <form className="search-page-form" role="search" onSubmit={(event) => {
          event.preventDefault()
          resultsRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' })
          resultsRef.current?.focus({ preventScroll: true })
        }}>
          <label className="sr-only" htmlFor="bakery-search">Search our bakery</label>
          <div className="search-page-field">
            <Search size={22} strokeWidth={1.5} aria-hidden="true" />
            <input ref={inputRef} id="bakery-search" name="q" type="search" placeholder="Try birthday, chocolate, laddu…" value={query} onChange={(event) => updateFilter('q', event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape' && query) { event.preventDefault(); clearSearch() } }} autoComplete="off" maxLength={160} />
            {query && <button type="button" className="icon-button search-page-clear" aria-label="Clear search" onClick={clearSearch}><X size={19} aria-hidden="true" /></button>}
            <button className="button button--gold search-page-submit" type="submit" aria-label="Search collection"><span>Search</span><ArrowRight size={19} aria-hidden="true" /></button>
          </div>
          <div className="search-page-suggestions" role="group" aria-label="Popular searches"><span>Popular searches</span>{['Birthday', 'Chocolate', 'Laddu'].map((term) => <button type="button" key={term} onClick={() => { updateFilter('q', term.toLowerCase()); inputRef.current?.focus({ preventScroll: true }) }}>{term}<ArrowUpRight size={13} aria-hidden="true" /></button>)}</div>
        </form>
      </div>
    </section>

    <section className="search-page-results" aria-labelledby="search-results-title">
      <div className="container">
        <div className="search-page-results-heading"><div><p className="eyebrow">THE BAKERY COLLECTION</p><h2 id="search-results-title" ref={resultsRef} tabIndex={-1}>{filtered ? 'Your search results' : 'Explore our collection'}</h2></div><p className="search-page-collection-note"><Wheat size={19} strokeWidth={1.25} aria-hidden="true" />Thoughtfully made. Joyfully shared.</p></div>
        <div className="search-page-categories" role="group" aria-label="Search categories">{['All', ...heroCollections.map((item) => item.name)].map((name) => <button key={name} className={category === name ? 'is-selected' : ''} aria-label={name === 'All' ? 'All treats' : name} aria-pressed={category === name} onClick={() => updateFilter('category', name)}><span>{name === 'All' ? 'All treats' : name}</span><span className="search-page-category-count" aria-hidden="true">{catalogProducts.filter((product) => name === 'All' || product.category === name).length}</span></button>)}</div>
        <div className="search-page-toolbar">
          <p className="search-page-count" role="status" aria-live="polite" aria-atomic="true">{results.length} {results.length === 1 ? 'treat' : 'treats'}{category !== 'All' ? ` in ${category.toLowerCase()}` : ' to discover'}{words.length ? <> matching <span>“{query.trim()}”</span></> : ''}</p>
          {filtered && <button className="search-page-reset" onClick={reset}>Reset filters<X size={15} aria-hidden="true" /></button>}
        </div>
        {results.length ? <div className="search-page-grid">{results.map((product) => <CatalogProductCard key={product.id} product={product} onAdd={onAdd} onBuy={onBuy} />)}</div> : <div className="search-page-empty">
          <span className="search-page-empty-icon"><Search size={30} strokeWidth={1.25} aria-hidden="true" /></span>
          <p className="eyebrow">LET’S FIND SOMETHING LOVELY</p><h3>No treats found just yet.</h3>
          <p>Try a different word{category !== 'All' ? ' or choose another category' : ', like “birthday” or “chocolate”'}.<br />There’s still plenty of goodness to explore.</p>
          <button className="button button--gold" onClick={reset}>Explore all treats<ArrowRight size={18} aria-hidden="true" /></button>
        </div>}
        <div className="search-page-footer"><Link className="text-link" to="/"><ArrowLeft size={17} aria-hidden="true" />Back to the bakery</Link><p>Find your favourite, explore the details, and make it yours.</p></div>
      </div>
    </section>
  </div>
}
