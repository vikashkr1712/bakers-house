import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronRight, CreditCard, MapPin, ShieldCheck, ShoppingBag, Store, Tag, Truck } from 'lucide-react'
import { getUnitPrice } from '../data/catalog'
import { DEMO_OFFERS, getCheckoutTotals } from '../utils/checkoutPricing'
import { ORDERING_CONFIG } from '../config/ordering'
import { getAvailableSlots, getScheduleDateBounds, getServiceability } from '../utils/fulfilment'
import { checkoutQuote, formatOrderPrice as money, paymentChoices, validateCheckout } from '../utils/whatsappOrder'
import { forgetTestOrder, getTestPaymentOrder, serializeTestCheckout } from '../utils/testPaymentLinks'
import TestPaymentLink from '../components/TestPaymentLink'
import CustomerWhatsAppChat from '../components/CustomerWhatsAppChat'
import HamperContents from '../components/HamperContents'
import '../styles/checkout.css'

const emptyFields = { name: '', phone: '', message: '', address: '', city: '', pincode: '', landmark: '' }
const DRAFT_KEY = 'bakers-house-test-checkout-v1'
function readDraft(signature) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY))
    if (saved?.signature === signature && saved.checkout?.fields && Date.now() - saved.createdAt >= 0 && Date.now() - saved.createdAt < 86400000) return saved.checkout
  } catch { /* Checkout still works when browser storage is unavailable. */ }
  return null
}

function Field({ name, label, fields, setFields, errors, optional = false, ...props }) {
  return <div className="checkout-field"><label htmlFor={`checkout-${name}`}>{label}{optional ? <span> (optional)</span> : ' *'}</label><input id={`checkout-${name}`} name={name} value={fields[name]} required={!optional} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `checkout-${name}-error` : undefined} onChange={(event) => setFields((current) => ({ ...current, [name]: event.target.value }))} {...props} />{errors[name] && <p className="checkout-error" id={`checkout-${name}-error`}>{errors[name]}</p>}</div>
}

export default function CheckoutPage({ basket }) {
  const [searchParams] = useSearchParams()
  const scope = searchParams.get('item')
  const hasScope = searchParams.has('item')
  const requestedQuantity = Number(searchParams.get('quantity'))
  const quantityIsValid = Number.isInteger(requestedQuantity) && requestedQuantity >= 1 && requestedQuantity <= 99
  const items = basket.items.filter((item) => !hasScope || item.key === scope).map((item) => ({ ...item, quantity: hasScope && quantityIsValid ? requestedQuantity : item.quantity, product: basket.productFor(item) })).filter((item) => item.product)
  const count = items.reduce((total, item) => total + item.quantity, 0)
  const signature = JSON.stringify({ query: searchParams.toString(), items: items.map(({ key, quantity }) => ({ key, quantity })) })
  const [initialDraft] = useState(() => readDraft(signature))
  const [fields, setFields] = useState(() => ({ ...emptyFields, ...initialDraft?.fields }))
  const [fulfilment, setFulfilment] = useState(initialDraft?.fulfilment || 'pickup')
  const [storeId, setStoreId] = useState(initialDraft?.storeId || ORDERING_CONFIG.stores[0]?.id || '')
  const [requestedDate, setRequestedDate] = useState(initialDraft?.requestedDate || '')
  const [slotId, setSlotId] = useState(initialDraft?.slotId || '')
  const [paymentMethod, setPaymentMethod] = useState(paymentChoices('pickup')[0]?.id || '')
  const [whatsappConsent, setWhatsappConsent] = useState(initialDraft?.whatsappConsent === true)
  const [errors, setErrors] = useState({})
  const [ready, setReady] = useState(initialDraft)
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const [chatNotice, setChatNotice] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [offerInput, setOfferInput] = useState(initialDraft?.couponCode || '')
  const [couponCode, setCouponCode] = useState(initialDraft?.couponCode || '')
  const [offerMessage, setOfferMessage] = useState('')
  const submitting = useRef(false)
  const formRef = useRef(null)
  const readyRef = useRef(null)
  const previousSignature = useRef(signature)
  const totals = checkoutQuote(items, fulfilment, couponCode)
  const selectedStore = ORDERING_CONFIG.stores.find((store) => store.id === storeId)
  const slots = useMemo(() => getAvailableSlots(requestedDate, fulfilment, storeId), [requestedDate, fulfilment, storeId])
  const bounds = getScheduleDateBounds()
  const service = getServiceability(fields.pincode)
  const choices = paymentChoices(fulfilment)
  const inactiveOffer = Boolean(totals.offerError)
  const activeCode = inactiveOffer ? '' : couponCode
  const checkoutTotal = inactiveOffer ? checkoutQuote(items, fulfilment, '') : totals
  const paymentDisabled = totals.needsPriceConfirmation || !items.length || items.some((item) => item.product.available === false)

  useEffect(() => {
    if (previousSignature.current !== signature) {
      previousSignature.current = signature
      setReady(null); setConfirmedOrder(null); setSubmitError(''); submitting.current = false
      try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* In-memory checkout remains usable. */ }
      forgetTestOrder()
    }
  }, [signature])
  useEffect(() => { if (confirmedOrder?.id) readyRef.current?.focus() }, [confirmedOrder?.id])
  useEffect(() => {
    if (!confirmedOrder || !['awaiting_customer_message', 'window_expired', 'pending', 'sending', 'accepted', 'sent'].includes(confirmedOrder.confirmationDelivery?.status)) return
    const controller = new AbortController()
    let active = true
    let inFlight = false
    let timer
    async function refreshConfirmation() {
      if (!active || inFlight || document.visibilityState === 'hidden') return
      clearTimeout(timer)
      inFlight = true
      try {
        const next = await getTestPaymentOrder(confirmedOrder, { signal: controller.signal })
        if (active) setConfirmedOrder(next)
      } catch { /* Keep the verified receipt and retry a transient status failure. */ }
      finally {
        inFlight = false
        if (active) timer = setTimeout(refreshConfirmation, 5000)
      }
    }
    const onFocus = () => { if (document.visibilityState !== 'hidden') refreshConfirmation() }
    timer = setTimeout(refreshConfirmation, 5000)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      active = false; clearTimeout(timer); controller.abort()
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [confirmedOrder])

  function changeFulfilment(value) {
    setFulfilment(value)
    setErrors({})
    setSlotId('')
    setOfferMessage('')
    if (!paymentChoices(value).some((choice) => choice.id === paymentMethod)) setPaymentMethod(paymentChoices(value)[0]?.id || '')
  }

  function applyOffer(code) {
    const normalized = code.trim().toUpperCase()
    if (!normalized) { setOfferMessage('Enter an offer code.'); return }
    const next = getCheckoutTotals(totals.subtotal, fulfilment, normalized, ORDERING_CONFIG.delivery.fee)
    if (next.offerError) { setOfferMessage(next.offerError); return }
    setCouponCode(normalized)
    setOfferInput(normalized)
    setOfferMessage(`${normalized} applied. One offer per order request.`)
  }

  function submitOrder(event) {
    event.preventDefault()
    if (submitting.current || paymentDisabled) return
    setSubmitError('')
    const options = { items, fields, fulfilment, storeId, requestedDate, slotId, paymentMethod, couponCode: activeCode, whatsappConsent }
    const nextErrors = validateCheckout(options)
    if (!whatsappConsent) nextErrors.whatsappConsent = 'Please agree to receive your order summary and payment link on WhatsApp.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      formRef.current?.querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus()
      return
    }
    submitting.current = true
    const checkout = serializeTestCheckout(options)
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ signature, checkout, createdAt: Date.now() })) } catch { /* Payment creation also works without session persistence. */ }
    setConfirmedOrder(null)
    setReady(checkout)
  }

  function editDetails() {
    setReady(null); setConfirmedOrder(null); setSubmitError(''); submitting.current = false
    try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* No saved draft is required to edit. */ }
    forgetTestOrder()
  }

  return <div className="checkout-page">
    <section className="checkout-intro" aria-labelledby="checkout-title"><div className="container">
      <nav className="checkout-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><Link to="/cart">Your basket</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">Checkout</span></nav>
      <p className="eyebrow">A LITTLE CLOSER TO SOMETHING LOVELY</p><h1 id="checkout-title">Your finishing touches<span>.</span></h1><p>Choose your treats and collection details, then message the bakery on WhatsApp to receive your Razorpay test payment link. No real money is charged.</p>
    </div></section>
    <section className="checkout-content"><div className="container">
      {!items.length ? <div className="checkout-empty"><ShoppingBag size={36} strokeWidth={1.3} aria-hidden="true" /><h2>{hasScope ? 'This selection is no longer in your basket.' : 'Something lovely starts with a selection.'}</h2><p>Choose a favourite, then return here to prepare your order request.</p><Link to="/shop" className="button button--gold">Explore the bakery<ArrowRight size={18} aria-hidden="true" /></Link></div> : <div className="checkout-layout">
        <div className="checkout-details">
          {ready ? <section className="checkout-request-saved" ref={readyRef} tabIndex={-1} aria-labelledby={confirmedOrder ? 'checkout-ready-title' : undefined}>
            {confirmedOrder ? <>
              <span className="checkout-ready-icon"><Check size={27} aria-hidden="true" /></span><p className="eyebrow">RAZORPAY TEST MODE</p><h2 id="checkout-ready-title">Test order confirmed.</h2>
              <p className="checkout-description">Razorpay verified the full test payment and your test order is now placed. No real money was charged and no real bakery delivery or pickup is booked.</p>
              <dl className="checkout-contact-review"><div><dt>Order reference</dt><dd>{confirmedOrder.reference}</dd></div><div><dt>Order status</dt><dd>Confirmed · test order</dd></div><div><dt>Payment status</dt><dd>Paid · verified test payment</dd></div><div><dt>Customer WhatsApp number</dt><dd>+{confirmedOrder.customerPhone}</dd></div><div><dt>Test total</dt><dd>{money(confirmedOrder.amount / 100)}</dd></div><div><dt>{ready.fulfilment === 'delivery' ? 'Requested delivery' : 'Requested pickup'}</dt><dd>{ready.requestedDate} · {ORDERING_CONFIG.slots.find((slot) => slot.id === ready.slotId)?.label}</dd></div></dl>
              <p className="checkout-local-status">{confirmedOrder.confirmationDelivery?.status === 'read' ? 'Your WhatsApp confirmation has been read.' : confirmedOrder.confirmationDelivery?.status === 'delivered' ? `Order confirmation delivered to +${confirmedOrder.customerPhone} on WhatsApp.` : confirmedOrder.confirmationDelivery?.status === 'sent' ? `Order confirmation sent to +${confirmedOrder.customerPhone}; delivery is not yet confirmed.` : confirmedOrder.confirmationDelivery?.status === 'accepted' ? `WhatsApp accepted the confirmation for +${confirmedOrder.customerPhone}; delivery is not yet confirmed.` : confirmedOrder.confirmationDelivery?.status === 'window_expired' ? 'Your order is confirmed. Send your order reference to the bakery again to receive the WhatsApp confirmation; the previous 24-hour reply window has expired.' : confirmedOrder.confirmationDelivery?.status === 'awaiting_customer_message' ? 'Your order is confirmed. Send your order reference to the bakery from your entered number to receive the WhatsApp confirmation.' : confirmedOrder.confirmationDelivery?.status === 'failed' ? 'Your order is confirmed, but WhatsApp could not send the confirmation.' : confirmedOrder.confirmationDelivery?.status === 'unknown' ? 'Your order is confirmed. The WhatsApp confirmation result is uncertain; please check your phone.' : ['pending', 'sending'].includes(confirmedOrder.confirmationDelivery?.status) ? 'Your order is confirmed. Sending your WhatsApp confirmation…' : 'Your order is confirmed. WhatsApp confirmation needs the bakery’s business messaging connection.'}</p>
              <div className="test-payment-link"><CustomerWhatsAppChat order={confirmedOrder} confirmed onNotice={setChatNotice} />{chatNotice && <p className="test-payment-notice" role="status">{chatNotice}</p>}</div>
              <button type="button" className="checkout-edit" onClick={editDetails}><ArrowLeft size={16} aria-hidden="true" />Try another test order</button>
            </> : <><TestPaymentLink checkout={ready} onConfirmed={setConfirmedOrder} /><button type="button" className="checkout-edit" onClick={editDetails}><ArrowLeft size={16} aria-hidden="true" />Edit details</button></>}
          </section> : <form className="checkout-form" noValidate onSubmit={submitOrder} ref={formRef}>
            <p className="eyebrow">THE DETAILS THAT MATTER</p><h2>How can we reach you?</h2><p className="checkout-description">Use your customer WhatsApp number, separate from the bakery’s sender number. After checkout, send your order reference from that account to receive the bakery’s reply. All fields marked * are required.</p>
            <div className="checkout-fields"><Field name="name" label="Full name" fields={fields} setFields={setFields} errors={errors} autoComplete="name" maxLength={120} /><Field name="phone" label="WhatsApp number" fields={fields} setFields={setFields} errors={errors} type="tel" autoComplete="tel" maxLength={30} /></div>
            <fieldset className="checkout-fulfilment"><legend>How would you like your treats?</legend><div className="checkout-fulfilment-options">
              <label className={fulfilment === 'pickup' ? 'is-selected' : ''}><input type="radio" name="fulfilment" checked={fulfilment === 'pickup'} onChange={() => changeFulfilment('pickup')} aria-label="Store pickup" /><Store size={22} strokeWidth={1.5} aria-hidden="true" /><span><strong>Store pickup</strong><small>Collect a little happiness</small></span><b>Free</b></label>
              {ORDERING_CONFIG.delivery.enabled && <label className={fulfilment === 'delivery' ? 'is-selected' : ''}><input type="radio" name="fulfilment" checked={fulfilment === 'delivery'} onChange={() => changeFulfilment('delivery')} aria-label="Home delivery" /><Truck size={22} strokeWidth={1.5} aria-hidden="true" /><span><strong>Home delivery</strong><small>A treat to your doorstep</small></span><b>{money(ORDERING_CONFIG.delivery.fee)}</b></label>}
            </div></fieldset>
            {fulfilment === 'delivery' ? <div className="checkout-address"><p className="checkout-address-title"><MapPin size={17} aria-hidden="true" />Where should your treats go?</p><div className="checkout-fields"><Field name="address" label="Address" fields={fields} setFields={setFields} errors={errors} autoComplete="street-address" maxLength={300} placeholder="House / flat, street and area" /><div className="checkout-field-pair"><Field name="city" label="City" fields={fields} setFields={setFields} errors={errors} autoComplete="address-level2" maxLength={80} /><Field name="pincode" label="Pincode" fields={fields} setFields={setFields} errors={errors} autoComplete="postal-code" inputMode="numeric" maxLength={6} /></div><Field name="landmark" label="Landmark" fields={fields} setFields={setFields} errors={errors} optional maxLength={150} /></div><p className={`checkout-serviceability ${fields.pincode && !service.serviceable ? 'is-unavailable' : ''}`} role="status">{fields.pincode ? service.message : `Delivery is available to ${ORDERING_CONFIG.delivery.pincodes.join(', ')}.`}</p></div> : <div className="checkout-store"><div className="checkout-field"><label htmlFor="checkout-storeId">Pickup store *</label><select id="checkout-storeId" name="storeId" value={storeId} onChange={(event) => { setStoreId(event.target.value); setSlotId('') }} required><option value="" disabled>Choose a store</option>{ORDERING_CONFIG.stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select>{errors.storeId && <p className="checkout-error">{errors.storeId}</p>}</div>{selectedStore && <address><strong>{selectedStore.name}</strong>{selectedStore.address}<span>{selectedStore.hours}</span></address>}</div>}
            <fieldset className="checkout-schedule"><legend>A time to look forward to</legend><p className="checkout-field-help">Please allow {ORDERING_CONFIG.preparationLeadHours} hours for preparation. Slots follow India Standard Time and need bakery confirmation.</p><div className="checkout-field-pair"><div className="checkout-field"><label htmlFor="checkout-requestedDate">Requested date *</label><input id="checkout-requestedDate" name="requestedDate" type="date" min={bounds.minDate} max={bounds.maxDate} required value={requestedDate} aria-invalid={Boolean(errors.requestedDate)} onChange={(event) => { setRequestedDate(event.target.value); setSlotId('') }} />{errors.requestedDate && <p className="checkout-error">{errors.requestedDate}</p>}</div><div className="checkout-field"><label htmlFor="checkout-slotId">Time slot *</label><select id="checkout-slotId" name="slotId" required value={slotId} aria-invalid={Boolean(errors.slotId)} onChange={(event) => setSlotId(event.target.value)}><option value="">{requestedDate ? slots.length ? 'Choose a time slot' : 'No slots available' : 'Choose a date first'}</option>{slots.map((slot) => <option value={slot.id} key={slot.id}>{slot.label}</option>)}</select>{errors.slotId && <p className="checkout-error">{errors.slotId}</p>}</div></div></fieldset>
            <fieldset className="checkout-payment-preferences"><legend><CreditCard size={21} aria-hidden="true" />How would you like to pay?</legend>{choices.map((choice) => <label key={choice.id} className={paymentMethod === choice.id ? 'is-selected' : ''}><input type="radio" name="paymentMethod" value={choice.id} checked={paymentMethod === choice.id} onChange={() => setPaymentMethod(choice.id)} aria-label={choice.label} /><span><strong>{choice.label}</strong><small>{choice.description}</small></span></label>)}{errors.paymentMethod && <p className="checkout-error">{errors.paymentMethod}</p>}</fieldset>
            <div className="checkout-field checkout-special-request"><label htmlFor="checkout-message">Special instructions <span>(optional)</span></label><textarea id="checkout-message" name="message" rows={3} maxLength={1500} value={fields.message} onChange={(event) => setFields({ ...fields, message: event.target.value })} placeholder="A celebration, a dietary request, a little extra detail…" /></div>
            <div className="checkout-whatsapp-consent"><label><input type="checkbox" name="whatsappConsent" checked={whatsappConsent} onChange={(event) => setWhatsappConsent(event.target.checked)} required aria-invalid={Boolean(errors.whatsappConsent)} aria-describedby={errors.whatsappConsent ? 'whatsapp-consent-error' : undefined} /><span>I agree to receive my order summary, test payment link and confirmation as replies on WhatsApp after I message the bakery. *</span></label>{errors.whatsappConsent && <p id="whatsapp-consent-error" className="checkout-error">{errors.whatsappConsent}</p>}</div>
            <div className="checkout-payment-note"><ShieldCheck size={22} strokeWidth={1.4} aria-hidden="true" /><p>We save your pending test order and create a unique Razorpay link. Continue on WhatsApp and tap Send to request it from the bakery. The order confirms after verified test payment. No real money or fulfilment.</p></div>
            {paymentDisabled && <p className="checkout-payment-blocked" role="status">Some selections are unpriced or unavailable. Remove them from your basket before trying a test payment.</p>}
            {submitError && <p className="checkout-submit-error" role="alert">{submitError}</p>}
            <button className="button checkout-whatsapp-button checkout-review-button" type="submit" disabled={paymentDisabled}><CreditCard size={20} aria-hidden="true" />Continue to test payment<ArrowRight size={18} aria-hidden="true" /></button>
          </form>}
          <Link to="/cart" className="checkout-back"><ArrowLeft size={16} aria-hidden="true" />Back to your basket</Link>
        </div>
        <aside className="checkout-summary" aria-labelledby="checkout-summary-title"><div className="checkout-summary-heading"><div><p className="eyebrow">CHOSEN BY YOU</p><h2 id="checkout-summary-title">Your selection</h2></div><span>{count} {count === 1 ? 'item' : 'items'}</span></div>{hasScope && <p className="checkout-scope-note">Ordering with this selection. Your other favourites stay in your basket.</p>}
          <ul className="checkout-items">{items.map((item) => { const unitPrice = getUnitPrice(item.product, item.weight); return <li className="checkout-item" key={item.key}><img src={item.product.image} alt={item.product.alt} width="100" height="120" /><div><h3>{item.product.name}</h3>{(item.weight || item.flavour) && <p className="checkout-item-variant">{[item.weight, item.flavour, item.product.collection === 'cakes' ? item.eggPreference === 'with-egg' ? 'With egg preference' : 'Eggless preference' : ''].filter(Boolean).join(' · ')}</p>}{item.cakeMessage && <p className="checkout-item-variant">Cake message: {item.cakeMessage}</p>}<HamperContents product={item.product} /><p className="checkout-item-quantity">Quantity: {item.quantity}{Number.isFinite(unitPrice) && <> · {money(unitPrice)} each</>}</p><strong>{Number.isFinite(unitPrice) ? money(unitPrice * item.quantity) : 'Price on request'}</strong></div></li> })}</ul>
          {!ready && <Link className="checkout-edit-basket" to="/cart">Edit quantities & customisations<ArrowRight size={15} aria-hidden="true" /></Link>}
          <section className="checkout-offers" aria-labelledby="checkout-offers-title"><h3 id="checkout-offers-title"><Tag size={17} aria-hidden="true" />A little extra sweetness</h3><p>Choose one offer for your order request.</p><form className="checkout-offer-form" onSubmit={(event) => { event.preventDefault(); applyOffer(offerInput) }}><label htmlFor="checkout-offer-code" className="sr-only">Offer code</label><input id="checkout-offer-code" name="offerCode" placeholder="Enter offer code" value={offerInput} onChange={(event) => setOfferInput(event.target.value)} maxLength={30} autoComplete="off" spellCheck={false} disabled={Boolean(ready)} /><button type="submit" disabled={Boolean(ready)}>Apply</button></form><div className="checkout-offer-feedback" role="status" aria-live="polite">{totals.offerError || offerMessage}</div>{couponCode && <div className="checkout-applied-offer"><span>{!inactiveOffer && <Check size={14} aria-hidden="true" />}{couponCode} {inactiveOffer ? '· inactive' : 'applied'}</span><button type="button" disabled={Boolean(ready)} onClick={() => { setCouponCode(''); setOfferInput(''); setOfferMessage('Offer removed.') }} aria-label="Remove offer">Remove</button></div>}{!ready && <div className="checkout-offer-list">{DEMO_OFFERS.map((offer) => <button type="button" key={offer.code} onClick={() => applyOffer(offer.code)} aria-label={`Apply ${offer.code}`} disabled={couponCode === offer.code && !inactiveOffer}><span><strong>{offer.code}</strong><small>{offer.description}</small></span>{couponCode === offer.code && !inactiveOffer ? <Check size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}</button>)}</div>}</section>
          <dl className="checkout-totals"><div><dt>{totals.needsPriceConfirmation ? 'Priced items subtotal' : 'Subtotal'}</dt><dd>{money(checkoutTotal.subtotal)}</dd></div><div className="checkout-saving"><dt>Offer saving</dt><dd>−{money(checkoutTotal.discount)}</dd></div><div><dt>{fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</dt><dd>{checkoutTotal.deliveryFee ? money(checkoutTotal.deliveryFee) : 'Free'}</dd></div><div className="checkout-grand-total"><dt>{totals.needsPriceConfirmation ? 'Priced total' : 'Total'}</dt><dd data-testid="checkout-total">{money(checkoutTotal.total)}</dd></div></dl>
          <p className="checkout-summary-note">{totals.needsPriceConfirmation ? 'Some selections need a price before test payment.' : 'Your total is checked again on the server. This is a test order; no real money or bakery fulfilment.'} Your basket stays saved.</p>
        </aside>
      </div>}
    </div></section>
  </div>
}
