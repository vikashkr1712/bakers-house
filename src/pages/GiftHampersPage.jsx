import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowRight, Check, ChevronRight, Gift, Heart, Minus, Package, Plus, RotateCcw, Search, ShoppingBag, Trash2 } from 'lucide-react'
import { catalogProducts, chocolateProducts, sweetProducts, formatPrice, getUnitPrice } from '../data/catalog'
import { hamperPackaging, readyMadeHampers } from '../data/hampers'
import { matchesSubcategory } from '../data/subcategories'
import SubcategoryFilters from '../components/SubcategoryFilters'
import { normalizeHamperConfig, getHamperPrice, HAMPER_MAX_PACKS, HAMPER_NAME_MAX_LENGTH, HAMPER_MESSAGE_MAX_LENGTH } from '../utils/hamperBasket'
import '../styles/hampers.css'

const DRAFT_KEY = 'bakers-house-hamper-draft-v1'
const freshHamper = () => ({ name: 'Your Custom Hamper', packagingId: hamperPackaging[0].id, items: [], giftMessage: '' })
const packKey = (item) => [item.id, item.weight, item.flavour].map(encodeURIComponent).join('::')
const copyConfig = (config) => ({ name: config.name, packagingId: config.packagingId, items: config.items.map((item) => ({ ...item })), giftMessage: config.giftMessage || '', ...(config.presetId ? { presetId: config.presetId } : {}) })
const productFor = (id) => catalogProducts.find((product) => product.id === id)

function readDraft() {
  try {
    const saved = normalizeHamperConfig(JSON.parse(localStorage.getItem(DRAFT_KEY)))
    if (saved) return copyConfig(saved)
  } catch { /* A fresh hamper also works when storage is unavailable. */ }
  return freshHamper()
}

function HamperPhotos({ items, className = '' }) {
  const photos = items.map((item) => productFor(item.id)).filter(Boolean).slice(0, 4)
  return <div className={`hamper-photos ${className}`} data-photo-count={photos.length} aria-hidden="true">
    {photos.map((product, index) => <img key={`${product.id}-${index}`} src={product.image} alt="" width="600" height="600" loading="lazy" decoding="async" />)}
  </div>
}

export default function GiftHampersPage({ basket, onAddHamper }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const editKey = params.get('edit')
  const loadedEdit = useRef(null)
  const nameRef = useRef(null)
  const [draft, setDraft] = useState(readDraft)
  const [collection, setCollection] = useState('chocolates')
  const [mithai, setMithai] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [sweetType, setSweetType] = useState('')
  const [query, setQuery] = useState('')
  const [packSizes, setPackSizes] = useState({})
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editKey) { loadedEdit.current = null; return }
    if (loadedEdit.current === editKey) return
    loadedEdit.current = editKey
    const line = basket.items.find((item) => item.key === editKey)
    const config = line?.hamper && normalizeHamperConfig(line.hamper)
    if (config) { nameRef.current?.setCustomValidity(''); setDraft(copyConfig(config)); setStatus('Update your selection below, then save your hamper changes.'); setError('') }
    else setError('This hamper is no longer in your basket. You can create a new one below.')
  }, [editKey, basket.items])

  useEffect(() => {
    if (editKey) return
    try {
      if (!draft.items.length) localStorage.removeItem(DRAFT_KEY)
      else {
        const valid = normalizeHamperConfig(draft)
        if (valid) localStorage.setItem(DRAFT_KEY, JSON.stringify(valid))
      }
    } catch { /* Saving a hamper to the basket still works in memory. */ }
  }, [draft, editKey])

  const selected = draft.items.map((item) => ({ ...item, product: productFor(item.id) })).filter((item) => item.product)
  const packCount = selected.reduce((total, item) => total + item.quantity, 0)
  const packaging = hamperPackaging.find((option) => option.id === draft.packagingId) || hamperPackaging[0]
  const contentsTotal = selected.reduce((total, item) => total + getUnitPrice(item.product, item.weight) * item.quantity, 0)
  const total = contentsTotal + packaging.price
  const treats = catalogProducts.filter((product) => {
    const text = `${product.name} ${product.note} ${product.description} ${product.flavours.join(' ')}`.toLowerCase()
    return product.available && product.collection === collection && matchesSubcategory(product, subcategory, sweetType, mithai)
      && query.trim().toLowerCase().split(/\s+/).filter(Boolean).every((word) => text.includes(word))
  })

  function changeCollection(value) {
    setCollection(value); setMithai(''); setSubcategory(''); setSweetType(''); setQuery('')
  }
  function changeSubcategory(key, value) {
    if (key === 'mithai') { setMithai(value); setSubcategory(''); setSweetType('') }
    else if (key === 'subcategory') { setSubcategory(value); setSweetType('') }
    else setSweetType(value)
  }
  function viewResults() {
    const results = document.getElementById('hamper-results')
    results?.focus({ preventScroll: true })
    results?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
  function addTreat(product) {
    if (packCount >= HAMPER_MAX_PACKS || !['chocolates', 'sweets'].includes(product.collection) || !product.available) return
    const item = { id: product.id, weight: packSizes[product.id] || product.weights[0].label, flavour: product.flavours[0], quantity: 1 }
    setDraft((current) => {
      if (current.items.reduce((sum, line) => sum + line.quantity, 0) >= HAMPER_MAX_PACKS) return current
      const existing = current.items.find((line) => packKey(line) === packKey(item))
      return { ...current, presetId: undefined, items: existing ? current.items.map((line) => packKey(line) === packKey(item) ? { ...line, quantity: line.quantity + 1 } : line) : [...current.items, item] }
    })
    setError(''); setStatus(`${product.name} added to your hamper.`)
  }
  function updateQuantity(key, difference) {
    if (difference > 0 && packCount >= HAMPER_MAX_PACKS) return
    setDraft((current) => ({ ...current, presetId: undefined, items: current.items.map((item) => packKey(item) === key ? { ...item, quantity: item.quantity + difference } : item).filter((item) => item.quantity > 0) }))
    setError(''); setStatus('')
  }
  function removeTreat(key) {
    setDraft((current) => ({ ...current, presetId: undefined, items: current.items.filter((item) => packKey(item) !== key) }))
    setError(''); setStatus('')
  }
  function customizePreset(preset) {
    nameRef.current?.setCustomValidity('')
    setDraft(copyConfig(preset)); setError(''); setStatus(`${preset.name} is ready to make your own.`)
    navigate('/gift-hampers#customize')
  }
  function addPreset(preset) {
    const config = normalizeHamperConfig(preset)
    if (config && onAddHamper(config)) setStatus(`${preset.name} added to your basket.`)
    else setError('This hamper could not be added. Please try another selection.')
  }
  function submitHamper(event) {
    event.preventDefault()
    nameRef.current?.setCustomValidity(draft.name.trim() ? '' : 'Please give your hamper a name.')
    if (!event.currentTarget.reportValidity()) return
    const config = normalizeHamperConfig(draft)
    if (!config) { setError(`Choose between 1 and ${HAMPER_MAX_PACKS} available chocolate or sweet packs and a gift box.`); return }
    const key = onAddHamper(config, editKey ? { replaceKey: editKey } : undefined)
    if (!key) { setError('This hamper could not be saved. Please check your selection and try again.'); return }
    setDraft(copyConfig(config)); setError(''); setStatus('Your custom hamper has been added to your basket.')
    if (editKey) navigate('/cart')
  }
  function startFresh() {
    nameRef.current?.setCustomValidity('')
    setDraft(freshHamper()); setError(''); setStatus('Start with a little something they love.')
    if (editKey) navigate('/gift-hampers#customize', { replace: true })
  }

  const heroItems = [...chocolateProducts.slice(0, 2), ...sweetProducts.slice(0, 2)].map((product) => ({ id: product.id }))

  return <div className={`hampers-page ${packCount ? 'has-hamper-selection' : ''}`}>
    <section className="hamper-hero" aria-labelledby="hampers-title">
      <div className="container">
        <nav className="hamper-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">Gift hampers</span></nav>
        <div className="hamper-hero-layout">
          <div className="hamper-hero-copy"><p className="eyebrow">A LITTLE THOUGHT. A LOT OF JOY.</p><h1 id="hampers-title">A thoughtful gift.<br />Made <em>their way.</em></h1><p>Chocolates, traditional sweets, and a little something from the heart. Pick a hamper we’ve put together, or fill a box with their favourites.</p><div className="hamper-hero-actions"><Link className="button button--gold" to="/gift-hampers#ready-made">Explore gift hampers<ArrowDown size={18} aria-hidden="true" /></Link><Link className="button button--outline" to="/gift-hampers#customize">Create your own<Gift size={18} aria-hidden="true" /></Link></div><div className="hamper-hero-note"><Heart size={16} strokeWidth={1.5} aria-hidden="true" /><span>A personal selection. A thoughtful little note.</span></div></div>
          <div className="hamper-hero-visual"><HamperPhotos items={heroItems} /><div className="hamper-hero-caption"><Gift size={26} strokeWidth={1.2} aria-hidden="true" /><span>A box full of <em>little joys.</em><small>Choose the treats. Make it theirs.</small></span></div></div>
        </div>
      </div>
    </section>

    <section className="hamper-ready" id="ready-made" aria-labelledby="hamper-ready-title">
      <div className="container"><div className="hamper-section-heading"><div><p className="eyebrow">THOUGHTFULLY PUT TOGETHER</p><h2 id="hamper-ready-title">Good things, beautifully gathered.</h2></div><p>Ready to give, or ready for your own little twist. Every hamper can be customised.</p></div>
        <div className="hamper-preset-grid">{readyMadeHampers.map((preset) => {
          const packTotal = preset.items.reduce((sum, item) => sum + item.quantity, 0)
          const box = hamperPackaging.find((option) => option.id === preset.packagingId)
          return <article className="hamper-preset" key={preset.id}>
            <HamperPhotos items={preset.items} /><div className="hamper-preset-copy"><p className="hamper-preset-label">{packTotal} treat packs · {box?.name}</p><h3>{preset.name}</h3><p>{preset.description}</p><ul>{preset.items.map((item) => <li key={packKey(item)}><Check size={13} aria-hidden="true" /><span>{productFor(item.id)?.name} <small>· {item.weight}{item.quantity > 1 ? ` × ${item.quantity}` : ''}</small></span></li>)}</ul><div className="hamper-preset-footer"><strong>{formatPrice(getHamperPrice(preset))}<small>Including gift packaging</small></strong><button className="button button--gold" type="button" onClick={() => addPreset(preset)}>Add hamper to basket<ShoppingBag size={17} aria-hidden="true" /></button><button className="hamper-customize-link" type="button" onClick={() => customizePreset(preset)}>Customize this hamper<ArrowRight size={16} aria-hidden="true" /></button></div></div>
          </article>
        })}</div>
        <p className="hamper-catalogue-note">Contents and prices are sample catalogue selections. Availability and final details are confirmed before a real order.</p>
      </div>
    </section>

    <section className="hamper-builder" id="customize" aria-labelledby="hamper-builder-title">
      <div className="container"><div className="hamper-section-heading"><div><p className="eyebrow">PICK. PERSONALISE. MAKE THEM SMILE.</p><h2 id="hamper-builder-title">Fill a box with their favourites.</h2></div><p>Choose up to {HAMPER_MAX_PACKS} chocolate and sweet packs, pick your packaging, and finish with a little note.</p></div>
        <div className="hamper-builder-layout">
          <div className="hamper-treats">
            <div className="hamper-builder-steps" aria-label="How to build your hamper"><span><b>01</b>Choose your treats</span><span><b>02</b>Pick a gift box</span><span><b>03</b>Add your note</span></div>
            <div className="hamper-collection-tabs" role="group" aria-label="Hamper treat collections">{[['chocolates', 'Chocolates'], ['sweets', 'Sweets']].map(([id, label]) => <button key={id} type="button" aria-pressed={collection === id} onClick={() => changeCollection(id)}>{label}</button>)}</div>
            <div className="hamper-filter-bar"><SubcategoryFilters collection={collection} mithai={mithai} subcategory={subcategory} sweetType={sweetType} onChange={changeSubcategory} idPrefix="hamper" resultsCount={treats.length} onViewResults={viewResults} /><div className="hamper-search"><Search size={18} aria-hidden="true" /><label className="sr-only" htmlFor="hamper-search">Search hamper treats</label><input id="hamper-search" type="search" value={query} placeholder="Find a little favourite…" onChange={(event) => setQuery(event.target.value)} /></div></div>
            <p id="hamper-results" tabIndex={-1} className="hamper-results-count" role="status">{treats.length} {treats.length === 1 ? 'treat' : 'treats'} to choose from · {packCount} / {HAMPER_MAX_PACKS} packs selected</p>
            {treats.length ? <div className="hamper-product-grid">{treats.map((product) => {
              const weight = packSizes[product.id] || product.weights[0].label
              const selectedPacks = draft.items.filter((item) => item.id === product.id && item.weight === weight).reduce((sum, item) => sum + item.quantity, 0)
              return <article className="hamper-product" key={product.id}><div className="hamper-product-image"><img src={product.image} alt={product.alt} width="600" height="600" loading="lazy" decoding="async" /></div><div className="hamper-product-copy"><span>{product.category}</span><h3>{product.name}</h3><p>{product.note}</p><label className="sr-only" htmlFor={`hamper-pack-${product.id}`}>Pack size for {product.name}</label><select id={`hamper-pack-${product.id}`} value={weight} onChange={(event) => setPackSizes((current) => ({ ...current, [product.id]: event.target.value }))}>{product.weights.map((option) => <option key={option.label} value={option.label}>{option.label} · {formatPrice(option.price)}</option>)}</select><button type="button" className="hamper-add-treat" disabled={packCount >= HAMPER_MAX_PACKS} onClick={() => addTreat(product)} aria-label={`Add ${product.name} to hamper`}>{selectedPacks ? `Add another (${selectedPacks} selected)` : 'Add to hamper'}<Plus size={18} aria-hidden="true" /></button></div></article>
            })}</div> : <div className="hamper-empty-results"><Search size={28} aria-hidden="true" /><h3>No treats found just yet.</h3><p>Try another type or a different search.</p><button type="button" className="text-link" onClick={() => { setQuery(''); setMithai(''); setSubcategory(''); setSweetType('') }}>Show all {collection}<ArrowRight size={16} aria-hidden="true" /></button></div>}
          </div>

          <aside className="hamper-summary" id="hamper-summary" aria-labelledby="hamper-summary-title"><div className="hamper-summary-heading"><span className="hamper-summary-icon"><Gift size={25} strokeWidth={1.3} aria-hidden="true" /></span><div><p className="eyebrow">A GIFT, MADE PERSONAL</p><h2 id="hamper-summary-title">Your hamper</h2></div><span className="hamper-pack-count">{packCount}/{HAMPER_MAX_PACKS}</span></div>
            {selected.length ? <ul className="hamper-selected-items">{selected.map((item) => <li className="hamper-selected-item" key={packKey(item)}><img src={item.product.image} alt="" width="58" height="64" /><div><h3>{item.product.name}</h3><p>{item.weight} · {formatPrice(getUnitPrice(item.product, item.weight))} each</p><div className="hamper-item-actions"><div className="hamper-quantity"><button type="button" disabled={item.quantity <= 1} onClick={() => updateQuantity(packKey(item), -1)} aria-label={`Decrease ${item.product.name}, ${item.weight} in hamper`}><Minus size={14} aria-hidden="true" /></button><span aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span><button type="button" disabled={packCount >= HAMPER_MAX_PACKS} onClick={() => updateQuantity(packKey(item), 1)} aria-label={`Increase ${item.product.name}, ${item.weight} in hamper`}><Plus size={14} aria-hidden="true" /></button></div><button type="button" className="hamper-remove" onClick={() => removeTreat(packKey(item))} aria-label={`Remove ${item.product.name}, ${item.weight} from hamper`}><Trash2 size={15} aria-hidden="true" /></button></div></div></li>)}</ul> : <div className="hamper-summary-empty"><Package size={31} strokeWidth={1.1} aria-hidden="true" /><p>Your thoughtful gift starts here.</p><span>Add a favourite chocolate or sweet to begin.</span></div>}
            <form className="hamper-summary-form" onSubmit={submitHamper}>
              <fieldset className="hamper-packaging"><legend>Gift packaging</legend>{hamperPackaging.map((option) => <label key={option.id} className={draft.packagingId === option.id ? 'is-selected' : ''}><input type="radio" name="gift-packaging" value={option.id} checked={draft.packagingId === option.id} onChange={() => setDraft((current) => ({ ...current, packagingId: option.id }))} /><span><strong>{option.name}</strong><small>{option.description}</small></span><b>{formatPrice(option.price)}</b></label>)}</fieldset>
              <div className="hamper-form-field"><label htmlFor="hamper-name">Hamper name</label><input ref={nameRef} id="hamper-name" name="hamper-name" value={draft.name} required maxLength={HAMPER_NAME_MAX_LENGTH} onChange={(event) => { event.currentTarget.setCustomValidity(''); setDraft((current) => ({ ...current, name: event.target.value })); setStatus('') }} /></div>
              <div className="hamper-form-field"><label htmlFor="hamper-gift-message">Gift message <span>(optional)</span></label><textarea id="hamper-gift-message" name="gift-message" rows={3} placeholder="A little note to make them smile…" maxLength={HAMPER_MESSAGE_MAX_LENGTH} value={draft.giftMessage} onChange={(event) => setDraft((current) => ({ ...current, giftMessage: event.target.value }))} /><small className="hamper-message-count">{draft.giftMessage.length} / {HAMPER_MESSAGE_MAX_LENGTH}</small></div>
              <dl className="hamper-totals"><div><dt>Treats ({packCount} packs)</dt><dd>{formatPrice(contentsTotal)}</dd></div><div><dt>Gift packaging</dt><dd>{formatPrice(packaging.price)}</dd></div><div className="hamper-total"><dt>Hamper total</dt><dd>{formatPrice(total)}</dd></div></dl>
              {error && <p className="hamper-error" role="alert">{error}</p>}
              <button className="button button--gold hamper-submit" type="submit" disabled={!packCount} aria-label={editKey ? 'Save hamper changes' : 'Add custom hamper to basket'}>{editKey ? 'Save hamper changes' : 'Add hamper to basket'}<ShoppingBag size={18} aria-hidden="true" /></button>
              <button className="hamper-start-fresh" type="button" onClick={startFresh}><RotateCcw size={14} aria-hidden="true" />Start fresh</button>
              <p className="hamper-local-note">Your gift stays saved in this browser. Choose cash or Razorpay Test Mode at checkout, then send the order details to the bakery on WhatsApp for confirmation. No real money or fulfilment.</p>
            </form>
            <div className="hamper-status" role="status" aria-live="polite">{status && <p><Check size={16} aria-hidden="true" />{status}</p>}</div><Link to="/cart" className="text-link hamper-view-basket">View your basket<ArrowRight size={16} aria-hidden="true" /></Link>
          </aside>
        </div>
      </div>
    </section>
    {packCount > 0 && <Link className="hamper-mobile-review" to="/gift-hampers#hamper-summary"><span><strong>Review your hamper</strong><small>{packCount} {packCount === 1 ? 'pack' : 'packs'} selected</small></span><b>{formatPrice(total)}</b><ArrowDown size={18} aria-hidden="true" /></Link>}
  </div>
}
