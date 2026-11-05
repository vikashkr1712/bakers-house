import { useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, Check, ChevronRight, Clock3, Copy, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { contactDetails } from '../config/contact'
import '../styles/contact.css'

const topics = ['General enquiry', 'Our bakes', 'Ingredients & allergens', 'Feedback']
const initialFields = { name: '', email: '', topic: topics[0], message: '' }

export default function ContactPage() {
  const [fields, setFields] = useState(initialFields)
  const [draft, setDraft] = useState(null)
  const [copyStatus, setCopyStatus] = useState('')
  const previewRef = useRef(null)
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactDetails.address)}`

  function updateField(event) {
    const { name, value } = event.currentTarget
    event.currentTarget.setCustomValidity('')
    if (name === 'name' && !value.trim()) event.currentTarget.setCustomValidity('Please enter your name.')
    if (name === 'message' && !value.trim()) event.currentTarget.setCustomValidity('Please enter a message.')
    setFields((current) => ({ ...current, [name]: value }))
    setDraft(null)
    setCopyStatus('')
  }

  function prepareEnquiry(event) {
    event.preventDefault()
    const form = event.currentTarget
    form.elements.namedItem('name').setCustomValidity(fields.name.trim() ? '' : 'Please enter your name.')
    form.elements.namedItem('message').setCustomValidity(fields.message.trim() ? '' : 'Please enter a message.')
    if (!form.reportValidity()) return
    const subject = `Baker’s House enquiry — ${fields.topic}`
    const body = `Name: ${fields.name.trim()}\nEmail: ${fields.email.trim()}\nTopic: ${fields.topic}\n\n${fields.message.trim()}`
    setDraft({ body, href: `mailto:${contactDetails.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` })
    setCopyStatus('')
    requestAnimationFrame(() => previewRef.current?.focus({ preventScroll: false }))
  }

  async function copyEnquiry() {
    try {
      await navigator.clipboard.writeText(draft.body)
      setCopyStatus('Enquiry copied. You can paste it into an email.')
    } catch {
      setCopyStatus('Copy is unavailable in this browser. Use Open email app, or copy your message from the form.')
    }
  }

  return <div className="contact-page">
    <nav className="container contact-page-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">Contact</span></nav>
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
    <div className="container contact-section-layout">
      <div className="contact-section-copy">
        <p className="eyebrow">LET’S TALK GOOD BAKING</p>
        <h1 id="contact-title" className="contact-section-title" tabIndex={-1}>Good conversations<br />start <em>here.</em></h1>
        <p className="contact-section-intro">A question about our bakes, an idea to share, or just a hello. We’d love to hear from you.</p>
        <div className="contact-methods">
          <a className="contact-method" href={contactDetails.phoneHref} aria-label={`Call ${contactDetails.phone}`}><span className="contact-method-icon"><Phone size={21} strokeWidth={1.5} aria-hidden="true" /></span><span className="contact-method-copy"><span className="contact-method-label">Give us a call</span><span className="contact-method-value">{contactDetails.phone}</span></span><ArrowUpRight size={18} aria-hidden="true" /></a>
          <a className="contact-method" href={`mailto:${contactDetails.email}`} aria-label={`Email ${contactDetails.email}`}><span className="contact-method-icon"><Mail size={21} strokeWidth={1.5} aria-hidden="true" /></span><span className="contact-method-copy"><span className="contact-method-label">Write to us</span><span className="contact-method-value">{contactDetails.email}</span></span><ArrowUpRight size={18} aria-hidden="true" /></a>
          <a className="contact-method contact-method--address" href={directions} target="_blank" rel="noopener noreferrer" aria-label="Get directions to the Kanpur office"><span className="contact-method-icon"><MapPin size={22} strokeWidth={1.5} aria-hidden="true" /></span><span className="contact-method-copy"><span className="contact-method-label">Office address</span><span className="contact-method-value">{contactDetails.address}</span><span className="contact-directions">Get directions<ArrowRight size={14} aria-hidden="true" /></span></span><ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
        <div className="contact-visiting-note"><Clock3 size={18} strokeWidth={1.5} aria-hidden="true" /><p>Please call ahead to confirm visiting hours.</p></div>
        <p className="contact-source">Contact desk: <a href={contactDetails.sourceUrl} target="_blank" rel="noopener noreferrer">{contactDetails.organization}<ArrowUpRight size={13} aria-hidden="true" /></a></p>
      </div>

      <div className="contact-form-card">
        <div className="contact-form-heading"><span className="contact-form-mark"><Mail size={24} strokeWidth={1.25} aria-hidden="true" /></span><div><h2>Send a little note.</h2><p>Write your message, then review it in your email app.</p></div></div>
        <form className="contact-form" onSubmit={prepareEnquiry} aria-label="Prepare an email enquiry">
          <div className="contact-form-row">
            <div className="contact-form-field"><label htmlFor="contact-name">Your name <span aria-hidden="true">*</span></label><input id="contact-name" name="name" type="text" autoComplete="name" placeholder="Your full name" required maxLength={100} value={fields.name} onChange={updateField} /></div>
            <div className="contact-form-field"><label htmlFor="contact-email">Email address <span aria-hidden="true">*</span></label><input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} value={fields.email} onChange={updateField} /></div>
          </div>
          <div className="contact-form-field"><label htmlFor="contact-topic">Enquiry topic</label><select id="contact-topic" name="topic" value={fields.topic} onChange={updateField}>{topics.map((topic) => <option key={topic}>{topic}</option>)}</select></div>
          <div className="contact-form-field"><label htmlFor="contact-message">Your message <span aria-hidden="true">*</span></label><textarea id="contact-message" name="message" rows={5} placeholder="Tell us what’s on your mind…" required maxLength={2000} value={fields.message} onChange={updateField} aria-describedby="contact-message-count" /><div className="contact-field-meta"><span>* Required fields</span><span id="contact-message-count">{fields.message.length} / 2000</span></div></div>
          <button className="button button--gold contact-submit" type="submit">Prepare email<ArrowRight size={19} aria-hidden="true" /></button>
          <p className="contact-form-note">You’ll review and send from your email app. Your message isn’t stored on this website.</p>
        </form>
        {draft && <div className="contact-enquiry-preview" ref={previewRef} tabIndex={-1} role="status" aria-live="polite" aria-atomic="true"><span className="contact-preview-check"><Check size={18} aria-hidden="true" /></span><h3>Your email draft is ready.</h3><p>Open your email app to review your enquiry and send it to <strong>{contactDetails.email}</strong>.</p><div className="contact-preview-actions"><a className="button contact-open-email" href={draft.href}>Open email app<ArrowUpRight size={17} aria-hidden="true" /></a><button className="contact-copy" onClick={copyEnquiry} type="button"><Copy size={16} aria-hidden="true" />Copy enquiry</button></div>{copyStatus && <p className="contact-copy-status">{copyStatus}</p>}</div>}
      </div>
    </div>
    </section>
  </div>
}
