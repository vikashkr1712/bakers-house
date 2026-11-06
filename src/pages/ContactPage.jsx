import { useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, Check, ChevronRight, Clock3, Mail, MapPin, Phone, Wheat } from 'lucide-react'
import { Link } from 'react-router-dom'
import { contactDetails } from '../config/contact'
import '../styles/contact.css'

const topics = ['General enquiry', 'Our bakes', 'Ingredients & allergens', 'Feedback']
const initialFields = { name: '', email: '', topic: topics[0], message: '' }

export default function ContactPage() {
  const [fields, setFields] = useState(initialFields)
  const [sent, setSent] = useState(false)
  const successRef = useRef(null)
  const nameRef = useRef(null)
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactDetails.address)}`

  function updateField(event) {
    const { name, value } = event.currentTarget
    event.currentTarget.setCustomValidity('')
    if (name === 'name' && !value.trim()) event.currentTarget.setCustomValidity('Please enter your name.')
    if (name === 'message' && !value.trim()) event.currentTarget.setCustomValidity('Please enter a message.')
    setFields((current) => ({ ...current, [name]: value }))
    setSent(false)
  }

  function sendDemoMessage(event) {
    event.preventDefault()
    const form = event.currentTarget
    form.elements.namedItem('name').setCustomValidity(fields.name.trim() ? '' : 'Please enter your name.')
    form.elements.namedItem('message').setCustomValidity(fields.message.trim() ? '' : 'Please enter a message.')
    if (!form.reportValidity()) return
    // Demo only: keep the submission in React memory. No email or network request.
    setSent(true)
    requestAnimationFrame(() => successRef.current?.focus())
  }

  function writeAnother() {
    setFields(initialFields)
    setSent(false)
    nameRef.current?.focus()
  }

  return <div className="contact-page">
    <nav className="container contact-page-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">Contact</span></nav>
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="container contact-section-layout">
        <div className="contact-section-copy">
          <p className="eyebrow">LET’S TALK GOOD BAKING</p>
          <h1 id="contact-title" className="contact-section-title" tabIndex={-1}>Good conversations<br />start <em>here.</em></h1>
          <p className="contact-section-intro">A question about our bakes, a celebration on your mind, or just a little hello. There’s always room for a conversation.</p>
          <div className="contact-methods">
            <a className="contact-method" href={contactDetails.phoneHref} aria-label={`Call ${contactDetails.phone}`}><span className="contact-method-icon"><Phone size={21} strokeWidth={1.5} aria-hidden="true" /></span><span className="contact-method-copy"><span className="contact-method-label">Give us a call</span><span className="contact-method-value">{contactDetails.phone}</span></span><ArrowUpRight size={18} aria-hidden="true" /></a>
            <button className="contact-method contact-method--email" type="button" onClick={() => nameRef.current?.focus()} aria-label={`Try a demo message for ${contactDetails.email}`}><span className="contact-method-icon"><Mail size={21} strokeWidth={1.5} aria-hidden="true" /></span><span className="contact-method-copy"><span className="contact-method-label">Write a little note</span><span className="contact-method-value">{contactDetails.email}</span><span className="contact-method-hint">Try the demo form</span></span><ArrowRight size={18} aria-hidden="true" /></button>
            <a className="contact-method contact-method--address" href={directions} target="_blank" rel="noopener noreferrer" aria-label="Get directions to the Kanpur office"><span className="contact-method-icon"><MapPin size={22} strokeWidth={1.5} aria-hidden="true" /></span><span className="contact-method-copy"><span className="contact-method-label">Office address</span><span className="contact-method-value">{contactDetails.address}</span><span className="contact-directions">Get directions<ArrowRight size={14} aria-hidden="true" /></span></span><ArrowUpRight size={18} aria-hidden="true" /></a>
          </div>
          <div className="contact-visiting-note"><Clock3 size={18} strokeWidth={1.5} aria-hidden="true" /><p>Please call ahead to confirm visiting hours.</p></div>
          <p className="contact-source">Contact desk: <a href={contactDetails.sourceUrl} target="_blank" rel="noopener noreferrer">{contactDetails.organization}<ArrowUpRight size={13} aria-hidden="true" /></a></p>
        </div>

        <div className="contact-form-card">
          <div className="contact-form-topline"><span className="eyebrow">A NOTE FROM YOU</span><span className="contact-demo-badge">Demo mode</span></div>
          <div className="contact-form-heading"><h2>Send a little note.</h2><p>Sweet questions, thoughtful ideas, and everything in between.</p></div>
          <form className="contact-form" onSubmit={sendDemoMessage} aria-label="Send a demo message" aria-describedby="contact-demo-note">
            <div className="contact-form-row">
              <div className="contact-form-field"><label htmlFor="contact-name">Your name <span aria-hidden="true">*</span></label><input ref={nameRef} id="contact-name" name="name" type="text" autoComplete="name" placeholder="Your full name" required maxLength={100} value={fields.name} onChange={updateField} /></div>
              <div className="contact-form-field"><label htmlFor="contact-email">Email address <span aria-hidden="true">*</span></label><input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} value={fields.email} onChange={updateField} /></div>
            </div>
            <div className="contact-form-field"><label htmlFor="contact-topic">Enquiry topic</label><select id="contact-topic" name="topic" value={fields.topic} onChange={updateField}>{topics.map((topic) => <option key={topic}>{topic}</option>)}</select></div>
            <div className="contact-form-field"><label htmlFor="contact-message">Your message <span aria-hidden="true">*</span></label><textarea id="contact-message" name="message" rows={5} placeholder="Tell us what’s on your mind…" required maxLength={2000} value={fields.message} onChange={updateField} aria-describedby="contact-message-count" /><div className="contact-field-meta"><span>* Required fields</span><span id="contact-message-count">{fields.message.length} / 2000</span></div></div>
            <button className="button button--gold contact-submit" type="submit">Send demo message<ArrowRight size={19} aria-hidden="true" /></button>
            <p className="contact-form-note" id="contact-demo-note">This is a demo. No email will be sent to the company, and your message won’t be saved.</p>
          </form>
          <div aria-live="polite" aria-atomic="true">
            {sent && <div className="contact-demo-success" ref={successRef} tabIndex={-1} role="status"><span className="contact-success-check"><Check size={20} aria-hidden="true" /></span><h3>Message sent — demo only.</h3><p>Thank you for your note! This was a demo submission. No email was sent to the company and your message hasn’t been saved.</p><button className="text-link" type="button" onClick={writeAnother}>Write another message<ArrowRight size={17} aria-hidden="true" /></button></div>}
          </div>
        </div>
      </div>
    </section>

    <section className="contact-invitation" aria-labelledby="contact-invitation-title">
      <div className="container contact-invitation-layout">
        <div className="contact-invitation-photo"><img src="/images/bakery/banners/banner-fresh-pastries.webp" alt="Golden pastries arranged on a wooden board" width="1200" height="822" loading="lazy" decoding="async" /></div>
        <div className="contact-invitation-copy"><Wheat size={32} strokeWidth={1.1} aria-hidden="true" /><p className="eyebrow">A LITTLE INSPIRATION WHILE YOU’RE HERE</p><h2 id="contact-invitation-title">Something good.<br />For every <em>occasion.</em></h2><p>Celebration cakes, thoughtful chocolates, and familiar sweet favourites. Find a little joy to share.</p><Link className="text-link" to="/shop">Explore our collection<ArrowRight size={18} aria-hidden="true" /></Link></div>
      </div>
    </section>
  </div>
}
