import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useMatch, useNavigate } from 'react-router-dom'
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
import ContactPage from './pages/ContactPage'
import { focusContactPage } from './utils/contactNavigation'
import { useBasket } from './hooks/useBasket'
import ShopPage from './pages/ShopPage'
import CartPage from './pages/CartPage'
import SearchPage from './pages/SearchPage'
import AboutPage from './pages/AboutPage'
import StoryPage from './pages/StoryPage'
import CakesPage from './pages/CakesPage'
import CakeDetailPage from './pages/CakeDetailPage'
import CollectionPage from './pages/CollectionPage'
import CheckoutPage from './pages/CheckoutPage'
import GiftHampersPage from './pages/GiftHampersPage'
import { catalogProducts } from './data/catalog'
import { ABOUT_PAGE_ENABLED, CART_PAGE_ENABLED, CONTACT_PAGE_ENABLED, SHOP_ENABLED, STORY_PAGE_ENABLED } from './config/site'

function PagePosition() {
  const { pathname, hash } = useLocation()
  const path = pathname.replace(/\/+$/, '') || '/'
  const matchesCart = Boolean(useMatch('/cart'))
  const isStory = Boolean(useMatch('/our-story')) && STORY_PAGE_ENABLED
  const isContact = Boolean(useMatch('/contact')) && CONTACT_PAGE_ENABLED
  const isCart = CART_PAGE_ENABLED && matchesCart
  useEffect(() => {
    const isProduct = /^\/(cakes|products)\/[^/]+$/.test(path)
    const product = isProduct ? catalogProducts.find((item) => item.slug === path.split('/')[2] && (!path.startsWith('/cakes/') || item.collection === 'cakes')) : null
    const catalogTitle = path === '/gift-hampers' ? 'Gift Hampers' : path === '/cakes' ? 'Celebration Cakes' : isProduct ? product?.name || 'Product Not Found' : path === '/chocolates' ? 'Chocolates' : path === '/sweets' ? 'Traditional Sweets' : path === '/checkout' ? 'Review Your Order' : null
    document.title = catalogTitle ? `${catalogTitle} — Baker’s House` : isContact ? 'Contact Us — Baker’s House' : isStory ? 'Our Story — Baker’s House' : ABOUT_PAGE_ENABLED && path === '/about' ? 'About Us — Baker’s House' : path === '/search' ? 'Search the Bakery — Baker’s House' : isCart ? 'Your Basket — Baker’s House' : SHOP_ENABLED && path === '/shop' ? 'Shop the Collection — Baker’s House' : 'Baker’s House — Artisan Bakery'
    const frame = requestAnimationFrame(() => {
      if (hash) {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'auto' })
      } else if (isContact) {
        focusContactPage()
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' })
        document.getElementById('main-content')?.focus({ preventScroll: true })
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, path, isCart, isStory, isContact])
  return null
}

export default function App() {
  const [view, setView] = useState(null)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname.replace(/\/+$/, '') || '/'
  const isShop = SHOP_ENABLED && path === '/shop'
  const isSearch = path === '/search'
  const matchesCart = Boolean(useMatch('/cart'))
  const isCart = CART_PAGE_ENABLED && matchesCart
  const basket = useBasket()
  useEffect(() => {
    setView(null)
    if (isCart) setNotification(null)
  }, [location.pathname, location.search, location.hash, isCart])
  function openShop(category = 'All') {
    setView(null)
    const selected = typeof category === 'string' ? category.trim().toLowerCase().replace(/\s*&\s*/g, ' & ') : 'all'
    const destination = selected === 'chocolates' ? '/chocolates' : selected === 'sweets' ? '/sweets' : ['cakes', 'cakes & pastries', 'cake & pastries'].includes(selected) ? '/cakes' : '/shop'
    navigate(destination)
    if (path === destination) window.scrollTo({ top: 0, behavior: 'instant' })
  }
  function openProduct(product) {
    if (product.detailPath) navigate(product.detailPath, { state: { from: `${location.pathname}${location.search}` } })
    else setView({ type: 'product', product })
  }
  function openContact() {
    setView(null)
    navigate(CONTACT_PAGE_ENABLED ? '/contact' : '/')
    if (!CONTACT_PAGE_ENABLED) window.scrollTo({ top: 0, behavior: 'instant' })
    else if (location.pathname === '/contact') focusContactPage()
  }
  function openBasket() {
    setNotification(null)
    if (!CART_PAGE_ENABLED) {
      setView({ type: 'basket' })
      return
    }
    setView(null)
    navigate('/cart')
    if (isCart) window.scrollTo({ top: 0, behavior: 'instant' })
  }
  function addProduct(product, options) {
    const key = basket.add(product.id, options)
    if (!key) return null
    setNotification({ name: product.name, key: Date.now() })
    return key
  }
  function addHamper(config, options) {
    const key = basket.addHamper(config, options)
    if (!key) return null
    setNotification({ name: config.name, key: Date.now() })
    return key
  }
  function buyProduct(product, options = {}) {
    const key = basket.add(product.id, options)
    if (!key) return
    setNotification(null)
    navigate(`/checkout?${new URLSearchParams({ item: key, quantity: String(options.quantity || 1) })}`)
  }
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <PagePosition />
    <Navbar count={basket.count} open={setView} />
    <main id="main-content" tabIndex={-1}>
      <Routes><Route path="/" element={location.hash === '#contact' ? <Navigate to={CONTACT_PAGE_ENABLED ? '/contact' : '/'} replace /> : <>
      <Hero onShop={openShop} />
      <Features />
      <Categories onShop={openShop} />
      <OurStory />
      <BestSellers onShop={openShop} onAdd={addProduct} onBuy={buyProduct} />
      <Testimonials />
      <PromotionalBanner onShop={openShop} />
      </>} />
      <Route path="/cakes" element={<CakesPage onAdd={addProduct} onBuy={buyProduct} />} />
      <Route path="/cakes/:slug" element={<CakeDetailPage onAdd={addProduct} onBuy={buyProduct} />} />
      <Route path="/products/:slug" element={<CakeDetailPage onAdd={addProduct} onBuy={buyProduct} />} />
      <Route path="/chocolates" element={<CollectionPage collection="chocolates" onAdd={addProduct} onBuy={buyProduct} />} />
      <Route path="/sweets" element={<CollectionPage collection="sweets" onAdd={addProduct} onBuy={buyProduct} />} />
      <Route path="/checkout" element={<CheckoutPage basket={basket} />} />
      <Route path="/gift-hampers" element={<GiftHampersPage basket={basket} onAddHamper={addHamper} />} />
      <Route path="/cart" element={CART_PAGE_ENABLED ? <CartPage basket={basket} onShop={openShop} onAdd={addProduct} onProduct={openProduct} /> : <Navigate to="/" replace />} />
      <Route path="/shop" element={SHOP_ENABLED ? <ShopPage onAdd={addProduct} onBuy={buyProduct} /> : <Navigate to="/" replace />} />
      <Route path="/search" element={<SearchPage onProduct={openProduct} onAdd={addProduct} onBuy={buyProduct} />} />
      <Route path="/contact" element={CONTACT_PAGE_ENABLED ? <ContactPage /> : <Navigate to="/" replace />} />
      <Route path="/about" element={ABOUT_PAGE_ENABLED ? <AboutPage onContact={openContact} /> : <Navigate to="/" replace />} />
      <Route path="/our-story" element={STORY_PAGE_ENABLED ? <StoryPage onContact={openContact} /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} /></Routes>
    </main>
    <Footer onShop={openShop} onPrivacy={() => setView({ type: 'privacy' })} />
    <ShopDialogs view={view} setView={setView} basket={basket} onAdd={addProduct} onShop={openShop} onProductBack={() => isShop || isCart || isSearch ? setView(null) : openShop('All')} productBackLabel={isSearch ? 'Back to search results' : isCart ? 'Back to your basket' : 'Back to the bakery'} />
    <div className="toast-region" aria-live="polite" aria-atomic="true"><AnimatePresence>{notification && <motion.div className="toast" key={notification.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} onAnimationComplete={() => { window.setTimeout(() => setNotification((current) => current?.key === notification.key ? null : current), 4500) }}><Check size={18} /><span>{notification.name} added to basket</span><button className="toast-view" onClick={openBasket}>View basket</button><button className="icon-button" aria-label="Dismiss notification" onClick={() => setNotification(null)}><X size={16} /></button></motion.div>}</AnimatePresence></div>
  </>
}
