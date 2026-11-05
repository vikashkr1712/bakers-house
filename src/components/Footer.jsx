import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import Brand from './Brand'
import { focusContactPage } from '../utils/contactNavigation'
import { heroCollections } from '../data/catalog'
import { Link } from 'react-router-dom'
import { ABOUT_PAGE_ENABLED, CONTACT_PAGE_ENABLED, STORY_PAGE_ENABLED } from '../config/site'

export default function Footer({ onShop, onPrivacy }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [saved, setSaved] = useState(false)
  function subscribe(event) {
    event.preventDefault()
    try {
      localStorage.setItem('bakers-house-newsletter-demo', email.trim())
      setSaved(true)
      setStatus('Email saved on this device. No email has been sent.')
    } catch {
      setSaved(false)
      setStatus('Your email could not be saved on this device. Please try again.')
    }
  }
  return <footer className="site-footer" id="site-footer">
    <div className="container">
      <div className="footer-main">
        <div className="footer-brand"><Brand /><p>Thoughtfully made.<br />Joyfully shared.</p></div>
        <nav className="footer-links footer-explore" aria-label="Explore the bakery"><h2>Explore</h2><Link to="/#home">Home</Link><Link to={ABOUT_PAGE_ENABLED ? '/about' : '/'} onClick={() => { if (!ABOUT_PAGE_ENABLED) window.scrollTo({ top: 0, behavior: 'instant' }) }}>About us</Link><Link to={STORY_PAGE_ENABLED ? '/our-story' : '/'} onClick={() => { if (!STORY_PAGE_ENABLED) window.scrollTo({ top: 0, behavior: 'instant' }) }}>Our story</Link><button onClick={() => onShop('All')}>Our bakery</button><Link to={CONTACT_PAGE_ENABLED ? '/contact' : '/'} onClick={() => { if (CONTACT_PAGE_ENABLED) focusContactPage(); else window.scrollTo({ top: 0, behavior: 'instant' }) }}>Contact</Link></nav>
        <nav className="footer-links footer-bakes" aria-label="Our collections"><h2>Our collections</h2>{heroCollections.map((category) => <button key={category.name} onClick={() => onShop(category.name)}>{category.name}</button>)}</nav>
        <div className="footer-newsletter">
          <h2>Stay close to the bakery</h2>
          <p>News and seasonal treats are on the way. Save your email for later.</p>
          <form onSubmit={subscribe}>
            <label className="sr-only" htmlFor="newsletter-email">Your email address</label>
            <div className="newsletter-input"><input id="newsletter-email" type="email" name="email" placeholder="Your email address" required autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setStatus(''); setSaved(false) }} maxLength={254} /><button type="submit" aria-label="Save email address">{saved ? <Check size={19} /> : <ArrowRight size={19} />}</button></div>
            <p className={`newsletter-status ${saved ? 'is-success' : ''}`} role="status">{status || 'Saved only on this device. Updates are not being sent yet.'}</p>
          </form>
        </div>
      </div>
      <div className="footer-bottom"><p>© {new Date().getFullYear()} Baker’s House. All rights reserved.</p><div><span>Made with care, from the first crumb.</span><button onClick={onPrivacy}>Privacy</button></div></div>
    </div>
  </footer>
}
