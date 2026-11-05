import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import Brand from './Brand'
import { focusContactPage } from '../utils/contactNavigation'
import { Link, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { ABOUT_PAGE_ENABLED, CART_PAGE_ENABLED, CONTACT_PAGE_ENABLED, SHOP_ENABLED, STORY_PAGE_ENABLED } from '../config/site'

export default function Navbar({ count, open }) {
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const path = pathname.replace(/\/+$/, '') || '/'
  const go = useNavigate()
  const isShop = (SHOP_ENABLED && path === '/shop') || /^\/(cakes|chocolates|sweets|products)(\/|$)/.test(path)
  const isSearch = path === '/search'
  const isAbout = ABOUT_PAGE_ENABLED && path === '/about'
  const isStory = Boolean(useMatch('/our-story')) && STORY_PAGE_ENABLED
  const isContact = Boolean(useMatch('/contact')) && CONTACT_PAGE_ENABLED
  const matchesCart = Boolean(useMatch('/cart'))
  const isCart = CART_PAGE_ENABLED && matchesCart
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1100px)')
    const closeWide = () => { if (media.matches) setMenu(false) }
    const onKey = (event) => { if (event.key === 'Escape') setMenu(false) }
    media.addEventListener('change', closeWide)
    document.addEventListener('keydown', onKey)
    return () => { media.removeEventListener('change', closeWide); document.removeEventListener('keydown', onKey) }
  }, [])
  const links = [{ label: 'Home', to: '/#home' }, { label: 'About', to: ABOUT_PAGE_ENABLED ? '/about' : '/' }, { label: 'Shop', to: '/shop' }, { label: 'Our Story', to: STORY_PAGE_ENABLED ? '/our-story' : '/' }, { label: 'Contact', to: CONTACT_PAGE_ENABLED ? '/contact' : '/' }]
  const current = isContact ? 'Contact' : isStory ? 'Our Story' : isAbout ? 'About' : isShop ? 'Shop' : path === '/' ? 'Home' : null
  const isPage = isShop || isAbout || isStory || isContact
  function navigate(link) {
    setMenu(false)
    if (link.to === '/') {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    if (link.to === '/shop' && path === '/shop') window.scrollTo({ top: 0, behavior: 'smooth' })
    if (link.to === '/about' && isAbout) window.scrollTo({ top: 0, behavior: 'smooth' })
    if (link.to === '/our-story' && isStory) window.scrollTo({ top: 0, behavior: 'smooth' })
    if (link.to === '/contact' && isContact) focusContactPage()
    if (link.action) open({ type: link.action })
  }
  return <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="container nav-inner">
      <Brand onClick={() => setMenu(false)} />
      <nav className="desktop-nav" aria-label="Main navigation">{links.map((link) => link.to
        ? <Link key={link.label} to={link.to} aria-current={current === link.label ? (isPage ? 'page' : 'location') : undefined} className={`nav-link ${current === link.label ? 'is-active' : ''}`} onClick={() => navigate(link)}>{link.label}</Link>
        : <button key={link.label} className={`nav-link ${current === link.label ? 'is-active' : ''}`} onClick={() => navigate(link)}>{link.label}</button>)}</nav>
      <div className="nav-actions">
        <button className="icon-button search-toggle" aria-label="Search bakery" aria-current={isSearch ? 'page' : undefined} onClick={() => { setMenu(false); if (isSearch) { window.scrollTo({ top: 0, behavior: 'instant' }); document.getElementById('bakery-search')?.focus({ preventScroll: true }) } else go('/search') }}><Search size={21} strokeWidth={1.5} /></button>
        {CART_PAGE_ENABLED
          ? <Link className="icon-button basket-toggle" to="/cart" aria-label={`Open basket, ${count} ${count === 1 ? 'item' : 'items'}`} aria-current={isCart ? 'page' : undefined} onClick={() => { setMenu(false); if (isCart) window.scrollTo({ top: 0, behavior: 'smooth' }) }}><ShoppingBag size={21} strokeWidth={1.5} /><span className="basket-count" aria-hidden="true">{count}</span></Link>
          : <button className="icon-button basket-toggle" aria-label={`Open basket, ${count} ${count === 1 ? 'item' : 'items'}`} onClick={() => { setMenu(false); open({ type: 'basket' }) }}><ShoppingBag size={21} strokeWidth={1.5} /><span className="basket-count" aria-hidden="true">{count}</span></button>}
        <button className="icon-button menu-toggle" aria-label={menu ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menu} aria-controls="mobile-navigation" onClick={() => setMenu(!menu)}>{menu ? <X size={23} /> : <Menu size={23} />}</button>
      </div>
    </div>
    <AnimatePresence>{menu && <motion.nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24 }}><div className="container">{links.map((link) => link.to ? <Link key={link.label} to={link.to} aria-current={current === link.label ? (isPage ? 'page' : 'location') : undefined} onClick={() => navigate(link)}>{link.label}</Link> : <button key={link.label} onClick={() => navigate(link)}>{link.label}</button>)}</div></motion.nav>}</AnimatePresence>
  </header>
}
