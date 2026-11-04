import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import Brand from './Brand'
import { categories } from '../data/categories'
import { Link } from 'react-router-dom'

export default function Footer({ onShop, onContact, onPrivacy }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  function subscribe(event) {
    event.preventDefault()
    try { localStorage.setItem('bakers-house-newsletter-demo', email.trim()) } catch { /* Demo confirmation works without storage. */ }
    setStatus('You’re on the demo list. No email has been sent.')
  }
  return <footer className="site-footer" id="contact">
    <div className="container">
      <div className="footer-main">
        <div className="footer-brand"><Brand /><p>Thoughtfully made.<br />Joyfully shared.</p></div>
        <nav className="footer-links footer-explore" aria-label="Explore the bakery"><h2>Explore</h2><Link to="/#home">Home</Link><Link to="/#our-story">Our story</Link><button onClick={() => onShop('All')}>Our bakery</button><button onClick={onContact}>Contact</button></nav>
        <nav className="footer-links footer-bakes" aria-label="Our bakes"><h2>Our bakes</h2>{categories.map((category) => <button key={category.name} onClick={() => onShop(category.name)}>{category.name}</button>)}</nav>
        <div className="footer-newsletter">
          <h2>A little goodness in your inbox</h2>
          <p>Fresh bakes, thoughtful stories, and things worth sharing.</p>
          <form onSubmit={subscribe}>
            <label className="sr-only" htmlFor="newsletter-email">Your email address</label>
            <div className="newsletter-input"><input id="newsletter-email" type="email" name="email" placeholder="Your email address" required autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setStatus('') }} maxLength={254} /><button type="submit" aria-label="Join the demo newsletter">{status ? <Check size={19} /> : <ArrowRight size={19} />}</button></div>
            <p className={`newsletter-status ${status ? 'is-success' : ''}`} role="status">{status || 'Demo signup · no emails are sent.'}</p>
          </form>
        </div>
      </div>
      <div className="footer-bottom"><p>© {new Date().getFullYear()} Baker’s House. All rights reserved.</p><div><span>Made with care, from the first crumb.</span><button onClick={onPrivacy}>Privacy</button></div></div>
    </div>
  </footer>
}
