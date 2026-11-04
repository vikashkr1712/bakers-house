import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ShopDialogs from './components/ShopDialogs'
import Hero from './sections/Hero'
import Features from './sections/Features'
import Categories from './sections/Categories'
import OurStory from './sections/OurStory'
import BestSellers from './sections/BestSellers'
import Testimonials from './sections/Testimonials'
import PromotionalBanner from './sections/PromotionalBanner'
import { useBasket } from './hooks/useBasket'
import ShopPage from './pages/ShopPage'
import { SHOP_ENABLED } from './config/site'

function PagePosition() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    document.title = SHOP_ENABLED && pathname === '/shop' ? 'Shop the Collection — Baker’s House' : 'Baker’s House — Artisan Bakery'
    const frame = requestAnimationFrame(() => {
      if (hash) {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'auto' })
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' })
        document.getElementById('main-content')?.focus({ preventScroll: true })
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])
  return null
}

export default function App() {
  const [view, setView] = useState(null)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const isShop = SHOP_ENABLED && location.pathname === '/shop'
  const basket = useBasket()
  useEffect(() => { setView(null) }, [location.pathname, location.search, location.hash])
  function openShop(category = 'All') {
    setView(null)
    if (!SHOP_ENABLED) {
      navigate('/')
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    navigate(category === 'All' ? '/shop' : `/shop?category=${encodeURIComponent(category.toLowerCase())}`)
    if (isShop) window.scrollTo({ top: 0, behavior: 'instant' })
  }
  function openProduct(product) { setView({ type: 'product', product }) }
  function addProduct(product) {
    basket.add(product.id)
    setNotification({ name: product.name, key: Date.now() })
  }
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <PagePosition />
    <Navbar count={basket.count} open={setView} />
    <main id="main-content" tabIndex={-1}>
      <Routes><Route path="/" element={<>
      <Hero onShop={openShop} />
      <Features />
      <Categories onShop={openShop} />
      <OurStory onDiscover={() => setView({ type: 'story' })} />
      <BestSellers onShop={openShop} onProduct={openProduct} onAdd={addProduct} />
      <Testimonials />
      <PromotionalBanner onShop={openShop} />
      </>} /><Route path="/shop" element={SHOP_ENABLED ? <ShopPage onProduct={openProduct} onAdd={addProduct} onBasket={() => setView({ type: 'basket' })} /> : <Navigate to="/" replace />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>
    </main>
    <Footer onShop={openShop} onContact={() => setView({ type: 'contact' })} onPrivacy={() => setView({ type: 'privacy' })} />
    <ShopDialogs view={view} setView={setView} basket={basket} onAdd={addProduct} onShop={openShop} isShop={isShop} />
    <div className="toast-region" aria-live="polite" aria-atomic="true"><AnimatePresence>{notification && <motion.div className="toast" key={notification.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} onAnimationComplete={() => { window.setTimeout(() => setNotification((current) => current?.key === notification.key ? null : current), 4500) }}><Check size={18} /><span>{notification.name} added to basket</span><button className="toast-view" onClick={() => { setView({ type: 'basket' }); setNotification(null) }}>View basket</button><button className="icon-button" aria-label="Dismiss notification" onClick={() => setNotification(null)}><X size={16} /></button></motion.div>}</AnimatePresence></div>
  </>
}
