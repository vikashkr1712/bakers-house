import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import Brand from './Brand'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ count, open }) {
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('Home')
  const { pathname } = useLocation()
  const isShop = pathname === '/shop'
  useEffect(() => {
    const sections = [['home', 'Home'], ['about', 'About'], ['our-story', 'Our Story'], ['shop', 'Shop'], ['contact', 'Contact']]
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      if (isShop) { setActive('Shop'); return }
      const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height || 92
      const current = sections.findLast(([id]) => {
        const section = document.getElementById(id)
        return section && section.getBoundingClientRect().top <= headerHeight + 64
      })
      setActive(current?.[1] || 'Home')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isShop])
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1100px)')
    const closeWide = () => { if (media.matches) setMenu(false) }
    const onKey = (event) => { if (event.key === 'Escape') setMenu(false) }
    media.addEventListener('change', closeWide)
    document.addEventListener('keydown', onKey)
    return () => { media.removeEventListener('change', closeWide); document.removeEventListener('keydown', onKey) }
  }, [])
  const links = [{ label: 'Home', to: '/#home' }, { label: 'About', to: '/#about' }, { label: 'Shop', to: '/shop' }, { label: 'Our Story', to: '/#our-story' }, { label: 'Contact', action: 'contact' }]
  const current = isShop ? 'Shop' : active
  function navigate(link) { setMenu(false); if (link.to) setActive(link.label); if (link.to === '/shop' && isShop) window.scrollTo({ top: 0, behavior: 'smooth' }); if (link.action) open({ type: link.action }) }
  return <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="container nav-inner">
      <Brand onClick={() => { setMenu(false); setActive('Home') }} />
      <nav className="desktop-nav" aria-label="Main navigation">{links.map((link) => link.to
        ? <Link key={link.label} to={link.to} aria-current={current === link.label ? (isShop ? 'page' : 'location') : undefined} className={`nav-link ${current === link.label ? 'is-active' : ''}`} onClick={() => navigate(link)}>{link.label}</Link>
        : <button key={link.label} className={`nav-link ${current === link.label ? 'is-active' : ''}`} onClick={() => navigate(link)}>{link.label}</button>)}</nav>
      <div className="nav-actions">
        <button className="icon-button" aria-label="Search bakery" onClick={() => { setMenu(false); open({ type: 'search' }) }}><Search size={21} strokeWidth={1.5} /></button>
        <button className="icon-button basket-toggle" aria-label={`Open basket, ${count} ${count === 1 ? 'item' : 'items'}`} onClick={() => { setMenu(false); open({ type: 'basket' }) }}><ShoppingBag size={21} strokeWidth={1.5} /><span className="basket-count" aria-hidden="true">{count}</span></button>
        <button className="icon-button menu-toggle" aria-label={menu ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menu} aria-controls="mobile-navigation" onClick={() => setMenu(!menu)}>{menu ? <X size={23} /> : <Menu size={23} />}</button>
      </div>
    </div>
    <AnimatePresence>{menu && <motion.nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24 }}><div className="container">{links.map((link) => link.to ? <Link key={link.label} to={link.to} aria-current={current === link.label ? (isShop ? 'page' : 'location') : undefined} onClick={() => navigate(link)}>{link.label}</Link> : <button key={link.label} onClick={() => navigate(link)}>{link.label}</button>)}</div></motion.nav>}</AnimatePresence>
  </header>
}
