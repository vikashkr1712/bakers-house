import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronRight, Mail, ShieldCheck, ShoppingBag } from 'lucide-react'
import { formatPrice, getUnitPrice } from '../data/catalog'
import HamperContents from '../components/HamperContents'
import '../styles/checkout.css'

const emptyFields = { name: '', email: '', phone: '', message: '' }

function validate(fields) {
  const errors = {}
  if (fields.name.trim().length < 2) errors.name = 'Enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) errors.email = 'Enter a valid email address.'
  const digits = fields.phone.replace(/\D/g, '')
  if (!/^\+?[\d\s().-]+$/.test(fields.phone.trim()) || digits.length < 10 || digits.length > 15) errors.phone = 'Enter a phone number with 10 to 15 digits.'
  return errors
}

export default function CheckoutPage({ basket }) {
  const [searchParams] = useSearchParams()
  const scope = searchParams.get('item')
  const hasScope = searchParams.has('item')
  const requestedQuantity = Number(searchParams.get('quantity'))
  const quantityIsValid = Number.isInteger(requestedQuantity) && requestedQuantity >= 1 && requestedQuantity <= 99
  const items = basket.items
    .filter((item) => !hasScope || item.key === scope)
    .map((item) => ({
      ...item,
      quantity: hasScope && quantityIsValid ? requestedQuantity : item.quantity,
      product: basket.productFor(item),
    }))
    .filter((item) => item.product)
  const pricedItems = items.filter((item) => Number.isFinite(getUnitPrice(item.product, item.weight)))
  const subtotal = pricedItems.reduce((total, item) => total + getUnitPrice(item.product, item.weight) * item.quantity, 0)
  const count = items.reduce((total, item) => total + item.quantity, 0)
  const [fields, setFields] = useState(emptyFields)
  const [errors, setErrors] = useState({})
  const [review, setReview] = useState(false)
  const [demoSent, setDemoSent] = useState(false)
  const formRef = useRef(null)
  const reviewRef = useRef(null)
  const successRef = useRef(null)
  const query = searchParams.toString()

  useEffect(() => { setReview(false); setDemoSent(false) }, [basket.items, query])
  useEffect(() => { if (review) reviewRef.current?.focus({ preventScroll: true }) }, [review])
  useEffect(() => { if (demoSent) successRef.current?.focus() }, [demoSent])

  function handleReview(event) {
    event.preventDefault()
    const nextErrors = validate(fields)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      formRef.current?.querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus()
      return
    }
    setFields((current) => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, value.trim()])))
    setReview(true)
  }

  return <div className="checkout-page">
    <section className="checkout-intro" aria-labelledby="checkout-title">
      <div className="container">
        <nav className="checkout-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><Link to="/cart">Your basket</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">Checkout</span></nav>
        <p className="eyebrow">A LITTLE CLOSER TO SOMETHING LOVELY</p>
        <h1 id="checkout-title">Your finishing touches<span>.</span></h1>
        <p>Review your favourites and try a demo enquiry. No email or order will be sent.</p>
      </div>
    </section>

    <section className="checkout-content">
      <div className="container">
        {!items.length ? <div className="checkout-empty"><ShoppingBag size={36} strokeWidth={1.3} aria-hidden="true" /><h2>{hasScope ? 'This selection is no longer in your basket.' : 'Something lovely starts with a selection.'}</h2><p>Choose a favourite cake, then return here to prepare your enquiry.</p><Link to="/cakes" className="button button--gold">Explore cakes<ArrowRight size={18} aria-hidden="true" /></Link><Link to="/cart" className="checkout-back"><ArrowLeft size={16} aria-hidden="true" />Back to your basket</Link></div> : <div className="checkout-layout">
          <div className="checkout-details">
            <ol className="checkout-steps" aria-label="Checkout progress"><li aria-current={!review ? 'step' : undefined}><span>{review ? <Check size={14} aria-hidden="true" /> : '1'}</span>Your details</li><li aria-current={review ? 'step' : undefined}><span>2</span>Review enquiry</li></ol>

            {review ? <section className="checkout-review" aria-labelledby="checkout-review-title">
              <p className="eyebrow">ONE LAST LOOK</p>
              <h2 id="checkout-review-title" tabIndex={-1} ref={reviewRef}>Ready to try your demo enquiry?</h2>
              <p className="checkout-description">Review your details, then try the demo below. Your message stays on this page and no real email or order is sent.</p>
              <dl className="checkout-contact-review"><div><dt>Name</dt><dd>{fields.name}</dd></div><div><dt>Email</dt><dd>{fields.email}</dd></div><div><dt>Phone</dt><dd>{fields.phone}</dd></div>{fields.message && <div><dt>Special requests</dt><dd>{fields.message}</dd></div>}</dl>
              {demoSent ? <div className="checkout-demo-success" ref={successRef} tabIndex={-1} role="status" aria-live="polite" aria-atomic="true"><Check size={24} aria-hidden="true" /><h3>Enquiry sent — demo only.</h3><p>No email was sent to the company and no order was placed. Your basket is still saved on this device.</p></div> : <button type="button" className="button button--gold checkout-send" onClick={() => setDemoSent(true)}><Mail size={18} aria-hidden="true" />Send demo enquiry<ArrowRight size={18} aria-hidden="true" /></button>}
              <div className="checkout-review-actions"><button type="button" onClick={() => { setReview(false); setDemoSent(false) }} className="checkout-edit"><ArrowLeft size={16} aria-hidden="true" />Edit your details</button></div>
            </section> : <form className="checkout-form" noValidate onSubmit={handleReview} ref={formRef}>
              <p className="eyebrow">THE DETAILS THAT MATTER</p>
              <h2>How can we reach you?</h2>
              <p className="checkout-description">Try the enquiry form with sample details. This is a demo; nothing is sent to the company. All fields marked * are required.</p>
              <div className="checkout-fields">
                <div className="checkout-field"><label htmlFor="checkout-name">Full name *</label><input id="checkout-name" name="name" autoComplete="name" value={fields.name} required maxLength={120} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'checkout-name-error' : undefined} onChange={(event) => setFields({ ...fields, name: event.target.value })} />{errors.name && <p className="checkout-error" id="checkout-name-error">{errors.name}</p>}</div>
                <div className="checkout-field"><label htmlFor="checkout-email">Email address *</label><input id="checkout-email" name="email" type="email" autoComplete="email" value={fields.email} required maxLength={254} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'checkout-email-error' : undefined} onChange={(event) => setFields({ ...fields, email: event.target.value })} />{errors.email && <p className="checkout-error" id="checkout-email-error">{errors.email}</p>}</div>
                <div className="checkout-field"><label htmlFor="checkout-phone">Phone number *</label><input id="checkout-phone" name="phone" type="tel" autoComplete="tel" value={fields.phone} required maxLength={30} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'checkout-phone-error' : 'checkout-phone-help'} onChange={(event) => setFields({ ...fields, phone: event.target.value })} /><p className="checkout-field-help" id="checkout-phone-help">Include your country code if you’re outside India.</p>{errors.phone && <p className="checkout-error" id="checkout-phone-error">{errors.phone}</p>}</div>
                <div className="checkout-field"><label htmlFor="checkout-message">Special requests <span>(optional)</span></label><textarea id="checkout-message" name="message" rows={4} maxLength={1500} value={fields.message} aria-describedby="checkout-message-help" onChange={(event) => setFields({ ...fields, message: event.target.value })} /><p className="checkout-field-help" id="checkout-message-help">Add a preferred date, delivery area, or an extra note for your selection.</p></div>
              </div>
              <div className="checkout-payment-note"><ShieldCheck size={22} strokeWidth={1.4} aria-hidden="true" /><p>Demo only. No payment is collected, no email is sent, and no order is placed. Your contact details are not saved.</p></div>
              <button className="button button--gold checkout-review-button" type="submit">Review your enquiry<ArrowRight size={18} aria-hidden="true" /></button>
            </form>}
            <Link to="/cart" className="checkout-back"><ArrowLeft size={16} aria-hidden="true" />Back to your basket</Link>
          </div>

          <aside className="checkout-summary" aria-labelledby="checkout-summary-title">
            <div className="checkout-summary-heading"><div><p className="eyebrow">CHOSEN BY YOU</p><h2 id="checkout-summary-title">Your selection</h2></div><span>{count} {count === 1 ? 'item' : 'items'}</span></div>
            {hasScope && <p className="checkout-scope-note">You’re enquiring about this selection. Your other favourites stay in your basket.</p>}
            <ul className="checkout-items">{items.map((item) => {
              const unitPrice = getUnitPrice(item.product, item.weight)
              return <li className="checkout-item" key={item.key}><img src={item.product.image} alt={item.product.alt} width="100" height="120" /><div><h3>{item.product.name}</h3>{(item.weight || item.flavour) && <p className="checkout-item-variant">{[item.weight, item.flavour].filter(Boolean).join(' · ')}</p>}<HamperContents product={item.product} /><p className="checkout-item-quantity">Quantity: {item.quantity}{Number.isFinite(unitPrice) && <> · {formatPrice(unitPrice)} each</>}</p><strong>{Number.isFinite(unitPrice) ? formatPrice(unitPrice * item.quantity) : 'Price on request'}</strong></div></li>
            })}</ul>
            <dl className="checkout-totals"><div><dt>{pricedItems.length < items.length ? 'Priced items subtotal' : 'Subtotal'}</dt><dd>{pricedItems.length ? formatPrice(subtotal) : 'Price on request'}</dd></div><div><dt>Order status</dt><dd>Demo only</dd></div></dl>
            <p className="checkout-summary-note">This is a demo enquiry. Your selection stays in your basket until you choose to remove it.</p>
          </aside>
        </div>}
      </div>
    </section>
  </div>
}
