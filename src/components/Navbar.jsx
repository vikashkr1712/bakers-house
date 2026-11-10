import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, Search, ShoppingBag, X } from 'lucide-react'
import Brand from './Brand'
import { focusContactPage } from '../utils/contactNavigation'
import { Link, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { cakeCategories } from '../data/catalog'
import { getCollectionSubcategories, sweetCollections } from '../data/subcategories'
import { ABOUT_PAGE_ENABLED, CART_PAGE_ENABLED, CONTACT_PAGE_ENABLED, SHOP_ENABLED, STORY_PAGE_ENABLED } from '../config/site'
import '../styles/navigation.css'

function ShopCollections({ id, mobile = false, onNavigate }) {
  return <div id={id} className={`shop-mega-panel${mobile ? ' mobile-shop-panel' : ''}`} role="region" aria-label="Shop collections">
    <div className={mobile ? 'shop-mega-inner' : 'container shop-mega-inner'}>
      <div className="shop-mega-intro"><div><p className="shop-mega-eyebrow">THE BAKER’S HOUSE COLLECTION</p><h2>A little joy, your way.</h2><p>Find a cake, a favourite chocolate, or something sweet to share.</p></div><Link className="shop-mega-all" to="/shop" onClick={onNavigate}>Shop all products<ArrowRight size={17} aria-hidden="true" /></Link></div>
      <div className="shop-mega-columns">
        <section className="shop-mega-column" aria-labelledby={`${id}-cakes`}><h3 id={`${id}-cakes`}><Link to="/cakes" onClick={onNavigate}>Cakes &amp; Pastries<ArrowUpRight size={16} aria-hidden="true" /></Link></h3><p>For every kind of celebration.</p><ul>{cakeCategories.map(category => <li key={category.id}><Link to={`/cakes?category=${category.id}`} onClick={onNavigate}>{category.name}<ArrowUpRight size={14} aria-hidden="true" /></Link></li>)}</ul></section>
        <section className="shop-mega-column" aria-labelledby={`${id}-chocolates`}><h3 id={`${id}-chocolates`}><Link to="/chocolates" onClick={onNavigate}>Chocolates<ArrowUpRight size={16} aria-hidden="true" /></Link></h3><p>A little everyday indulgence.</p><ul>{getCollectionSubcategories('chocolates').map(category => <li key={category.id}><Link to={`/chocolates?subcategory=${category.id}`} onClick={onNavigate}>{category.name}<ArrowUpRight size={14} aria-hidden="true" /></Link></li>)}</ul></section>
        <section className="shop-mega-column" aria-labelledby={`${id}-sweets`}><h3 id={`${id}-sweets`}><Link to="/sweets" onClick={onNavigate}>Sweets<ArrowUpRight size={16} aria-hidden="true" /></Link></h3><p>Familiar favourites, thoughtfully chosen.</p><div className="shop-mega-sweets">{sweetCollections.map(collection => <details key={collection.id} name={`${id}-mithai`}><summary>{collection.name}<ChevronDown size={15} aria-hidden="true" /></summary><div className="shop-mega-sweet-links"><Link className="shop-mega-collection-all" to={`/sweets?mithai=${collection.id}`} onClick={onNavigate}>View the collection<ArrowUpRight size={14} aria-hidden="true" /></Link>{getCollectionSubcategories('sweets', collection.id).map(category => <Link key={category.id} to={`/sweets?mithai=${collection.id}&subcategory=${category.id}`} onClick={onNavigate}>{category.name}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}</div></details>)}</div></section>
      </div>
    </div>
  </div>
}

export default function Navbar({ count, open }) {
  const [menu, setMenu] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef(null)
  const desktopShopRef = useRef(null)
  const mobileShopRef = useRef(null)
  const menuToggleRef = useRef(null)
  const shopCloseTimer = useRef(null)
  const { pathname, search, hash } = useLocation()
  const path = pathname.replace(/\/+$/, '') || '/'
  const go = useNavigate()
  const isShop = (SHOP_ENABLED && path === '/shop') || /^\/(cakes|chocolates|sweets|products)(\/|$)/.test(path)
  const isSearch = path === '/search'
  const isHampers = path === '/gift-hampers'
  const isAbout = ABOUT_PAGE_ENABLED && path === '/about'
  const isStory = Boolean(useMatch('/our-story')) && STORY_PAGE_ENABLED
  const isContact = Boolean(useMatch('/contact')) && CONTACT_PAGE_ENABLED
  const matchesCart = Boolean(useMatch('/cart'))
  const isCart = CART_PAGE_ENABLED && matchesCart
  function cancelShopClose() { window.clearTimeout(shopCloseTimer.current) }
  function closeNavigation() { setMenu(false); closeShop() }
  function closeShop(restoreFocus = false) {
    cancelShopClose()
    setShopOpen(false)
    if (restoreFocus) (window.matchMedia('(min-width: 1100px)').matches ? desktopShopRef : mobileShopRef).current?.focus()
  }
  function openShopOnHover(event) {
    if (event.pointerType === 'touch' || !window.matchMedia('(min-width: 1100px) and (hover: hover) and (pointer: fine)').matches) return
    cancelShopClose()
    setShopOpen(true)
  }
  function closeShopOnLeave(event) {
    if (event.pointerType === 'touch' || event.currentTarget.querySelector(':focus-visible')) return
    cancelShopClose()
    shopCloseTimer.current = window.setTimeout(() => closeShop(), 180)
  }
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    cancelShopClose()
    setMenu(false)
    setShopOpen(false)
  }, [pathname, search, hash])
  useEffect(() => () => cancelShopClose(), [])
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1100px)')
    const onResize = closeNavigation
    media.addEventListener('change', onResize)
    return () => media.removeEventListener('change', onResize)
  }, [])
  useEffect(() => {
    if (!menu && !shopOpen) return
    function outside(event) { if (!headerRef.current?.contains(event.target)) closeNavigation() }
    function escape(event) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      if (shopOpen) closeShop(true)
      else { setMenu(false); menuToggleRef.current?.focus() }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) }
  }, [menu, shopOpen])
  const links = [{ label: 'Home', to: '/#home' }, { label: 'About', to: ABOUT_PAGE_ENABLED ? '/about' : '/' }, { label: 'Shop', to: '/shop' }, { label: 'Gift Hampers', to: '/gift-hampers' }, { label: 'Our Story', to: STORY_PAGE_ENABLED ? '/our-story' : '/' }, { label: 'Contact', to: CONTACT_PAGE_ENABLED ? '/contact' : '/' }]
  const current = isContact ? 'Contact' : isStory ? 'Our Story' : isAbout ? 'About' : isHampers ? 'Gift Hampers' : isShop ? 'Shop' : path === '/' ? 'Home' : null
  const isPage = isShop || isHampers || isAbout || isStory || isContact
  function navigate(link) {
    closeNavigation()
    if (link.to === '/') window.scrollTo({ top: 0, behavior: 'instant' })
    if (link.to === '/shop' && path === '/shop') window.scrollTo({ top: 0, behavior: 'smooth' })
    if (link.to === '/gift-hampers' && isHampers) window.scrollTo({ top: 0, behavior: 'smooth' })
    if (link.to === '/about' && isAbout) window.scrollTo({ top: 0, behavior: 'smooth' })
    if (link.to === '/our-story' && isStory) window.scrollTo({ top: 0, behavior: 'smooth' })
    if (link.to === '/contact' && isContact) focusContactPage()
    if (link.action) open({ type: link.action })
  }
  function openShopFromArrow(event, mobile) {
    if (event.key !== 'ArrowDown') return
    event.preventDefault()
    cancelShopClose()
    setShopOpen(true)
    requestAnimationFrame(() => document.getElementById(mobile ? 'mobile-shop-panel' : 'desktop-shop-panel')?.querySelector('a')?.focus())
  }
  return <header ref={headerRef} className={`site-header ${scrolled ? 'is-scrolled' : ''}`} onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) closeNavigation() }}>
    <div className="container nav-inner">
      <Brand onClick={closeNavigation} />
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(link => link.label === 'Shop'
        ? <div className="shop-nav-item" key={link.label} onPointerEnter={openShopOnHover} onPointerLeave={closeShopOnLeave} onFocusCapture={cancelShopClose}><Link ref={desktopShopRef} to={link.to} className={`nav-link shop-nav-toggle${current === 'Shop' ? ' is-active' : ''}`} aria-current={current === 'Shop' ? 'page' : undefined} aria-expanded={shopOpen} aria-controls="desktop-shop-panel" onClick={() => navigate(link)} onKeyDown={event => openShopFromArrow(event, false)}>Shop<ChevronDown size={14} aria-hidden="true" /></Link>{shopOpen && <ShopCollections id="desktop-shop-panel" onNavigate={closeNavigation} />}</div>
        : <Link key={link.label} to={link.to} aria-current={current === link.label ? (isPage ? 'page' : 'location') : undefined} className={`nav-link ${current === link.label ? 'is-active' : ''}`} onClick={() => navigate(link)}>{link.label}</Link>)}</nav>
      <div className="nav-actions">
        <button className="icon-button search-toggle" aria-label="Search bakery" aria-current={isSearch ? 'page' : undefined} onClick={() => { closeNavigation(); if (isSearch) { window.scrollTo({ top: 0, behavior: 'instant' }); document.getElementById('bakery-search')?.focus({ preventScroll: true }) } else go('/search') }}><Search size={21} strokeWidth={1.5} /></button>
        {CART_PAGE_ENABLED
          ? <Link className="icon-button basket-toggle" to="/cart" aria-label={`Open basket, ${count} ${count === 1 ? 'item' : 'items'}`} aria-current={isCart ? 'page' : undefined} onClick={() => { closeNavigation(); if (isCart) window.scrollTo({ top: 0, behavior: 'smooth' }) }}><ShoppingBag size={21} strokeWidth={1.5} /><span className="basket-count" aria-hidden="true">{count}</span></Link>
          : <button className="icon-button basket-toggle" aria-label={`Open basket, ${count} ${count === 1 ? 'item' : 'items'}`} onClick={() => { closeNavigation(); open({ type: 'basket' }) }}><ShoppingBag size={21} strokeWidth={1.5} /><span className="basket-count" aria-hidden="true">{count}</span></button>}
        <button ref={menuToggleRef} className="icon-button menu-toggle" aria-label={menu ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menu} aria-controls="mobile-navigation" onClick={() => { setMenu(!menu); setShopOpen(false) }}>{menu ? <X size={23} /> : <Menu size={23} />}</button>
      </div>
    </div>
    <AnimatePresence>{menu && <motion.nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24 }}><div className="container">{links.map(link => link.label === 'Shop'
      ? <div className="mobile-shop-item" key={link.label}><div className="mobile-shop-heading"><Link to={link.to} aria-current={current === 'Shop' ? 'page' : undefined} onClick={() => navigate(link)} onKeyDown={event => openShopFromArrow(event, true)}>Shop</Link><button ref={mobileShopRef} type="button" className="mobile-shop-toggle" aria-label={shopOpen ? 'Hide Shop collections' : 'Show Shop collections'} aria-expanded={shopOpen} aria-controls="mobile-shop-panel" onClick={() => setShopOpen(!shopOpen)} onKeyDown={event => openShopFromArrow(event, true)}><ChevronDown size={17} aria-hidden="true" /></button></div>{shopOpen && <ShopCollections id="mobile-shop-panel" mobile onNavigate={closeNavigation} />}</div>
      : <Link key={link.label} to={link.to} aria-current={current === link.label ? (isPage ? 'page' : 'location') : undefined} onClick={() => navigate(link)}>{link.label}</Link>)}</div></motion.nav>}</AnimatePresence>
  </header>
}
