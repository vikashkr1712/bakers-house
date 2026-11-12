import { useEffect, useRef, useState } from 'react'
import { Check, CreditCard, ExternalLink, LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react'
import { checkoutFingerprint, createTestPaymentOrder, getTestPaymentConfig, getTestPaymentOrder, isOrderHandoffReady, markWhatsAppHandoff, paymentAttemptFor, rememberTestOrder } from '../utils/testPaymentLinks'
import { formatOrderPrice } from '../utils/whatsappOrder'
import CustomerWhatsAppChat from './CustomerWhatsAppChat'
import '../styles/test-payment-link.css'

export default function OrderCheckout({ checkout }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [restart, setRestart] = useState(0)
  const fresh = useRef(false)
  const checkNow = useRef(null)
  const checkoutRef = useRef(checkout)
  const headingRef = useRef(null)
  checkoutRef.current = checkout
  const fingerprint = checkoutFingerprint(checkout)
  const cash = checkout.paymentMethod === 'cod'

  useEffect(() => {
    let active = true
    let current = null
    let inFlight = false
    let failures = 0
    let timer
    const controller = new AbortController()
    const attempt = paymentAttemptFor(checkoutRef.current, { fresh: fresh.current })
    fresh.current = false
    setLoading(true); setOrder(null); setError(''); setNotice(''); setChecking(false)
    if (attempt.order?.paymentMethod === 'payment-link') {
      // Keep the saved identity available if the first post-return check fails.
      // Cached paid flags never unlock WhatsApp: a fresh API response must do so.
      current = { ...attempt.order, status: 'awaiting_payment', paymentStatus: 'pending', handoffReady: false, orderSummary: null, whatsappUrl: null }
      setOrder(current)
    }

    function accept(value) {
      if (!active) return
      current = value
      rememberTestOrder(attempt, value)
      setOrder(value); setError(''); failures = 0
      if (isOrderHandoffReady(value)) {
        clearTimeout(timer)
        if (markWhatsAppHandoff(attempt, value)) {
          // Navigate the current tab so async verification never needs a popup.
          // Persist first so returning from WhatsApp cannot cause a redirect loop.
          // WhatsApp still requires the customer to tap Send.
          try { window.open(value.whatsappUrl, '_self') }
          catch { /* The permanent on-page link and copy option remain usable. */ }
        }
      }
    }

    function schedule() {
      clearTimeout(timer)
      if (active && current?.status === 'awaiting_payment') timer = setTimeout(check, Math.min(20000, 4000 * (failures + 1)))
    }

    async function check() {
      if (!active || !current || inFlight || current.status !== 'awaiting_payment') return
      clearTimeout(timer); inFlight = true; setChecking(true)
      try { accept(await getTestPaymentOrder(current, { signal: controller.signal })) }
      catch (problem) { if (active && problem.name !== 'AbortError') { failures += 1; setError(problem.message) } }
      finally { inFlight = false; if (active) { setChecking(false); schedule() } }
    }

    async function initialize() {
      try {
        const config = await getTestPaymentConfig({ signal: controller.signal })
        if (!attempt.order && checkoutRef.current.paymentMethod !== 'cod' && !config.configured) throw new Error('Online test payment is unavailable. Your basket is saved. Edit details to choose cash or try again later.')
        const value = attempt.order
          ? await getTestPaymentOrder(attempt.order, { signal: controller.signal })
          : await createTestPaymentOrder(checkoutRef.current, attempt, { signal: controller.signal })
        accept(value); schedule()
      } catch (problem) { if (active && problem.name !== 'AbortError') setError(problem.message) }
      finally { if (active) { setLoading(false); schedule() } }
    }

    const onFocus = () => { if (document.visibilityState !== 'hidden') check() }
    checkNow.current = check
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    initialize()
    return () => {
      active = false; clearTimeout(timer); controller.abort(); checkNow.current = null
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [fingerprint, restart])

  const ready = isOrderHandoffReady(order)
  const terminal = order && ['expired', 'cancelled'].includes(order.status)
  const timestamp = order?.transactionAt || order?.paidAt
  const paymentTime = typeof timestamp === 'string' && Number.isFinite(Date.parse(timestamp))
    ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium', hour12: true }).format(new Date(timestamp)) + ' IST'
    : null
  useEffect(() => { if (ready) headingRef.current?.focus({ preventScroll: true }) }, [ready])

  return <section className="test-payment-link" aria-labelledby="order-checkout-title" aria-busy={loading || checking}>
    <span className="test-payment-mode"><ShieldCheck size={15} aria-hidden="true" />{cash ? 'SAMPLE ORDER · NO REAL FULFILMENT' : 'RAZORPAY TEST MODE · NO REAL MONEY'}</span>
    <h2 id="order-checkout-title" ref={headingRef} tabIndex={-1}>{ready ? 'Order request saved.' : cash ? 'Saving your cash order.' : 'Complete your test payment.'}</h2>
    <p className="test-payment-description">{ready ? 'Send the prepared message to the bakery on WhatsApp. The bakery will reply to confirm or decline availability and your requested slot.' : cash ? 'We check the price and save your request before opening WhatsApp.' : 'Choose a payment method on Razorpay. WhatsApp opens after the backend verifies the full successful test payment.'}</p>
    {loading && <p className="test-payment-loading" role="status"><LoaderCircle size={19} aria-hidden="true" />{cash ? 'Saving your order request…' : 'Preparing your unique Razorpay test payment link…'}</p>}
    {error && <div className="test-payment-error" role="alert">{error}</div>}
    {!loading && !order && <button type="button" className="button test-payment-primary" onClick={() => setRestart(value => value + 1)}><RefreshCw size={17} aria-hidden="true" />Try again</button>}
    {order && <>
      {!ready && !terminal && <div className="test-payment-next-step">
        {order.paymentStatus === 'pending' ? <p className="test-payment-waiting" role="status">Your saved payment is being verified. Please do not pay again. We will show the WhatsApp order message after Razorpay confirms capture.</p> : <>
          <a className="button test-payment-primary" href={order.paymentUrl}><CreditCard size={19} aria-hidden="true" />Pay through Razorpay<ExternalLink size={17} aria-hidden="true" /></a>
          <p className="test-payment-description">Pay {formatOrderPrice(order.amount / 100)} in Test Mode. Razorpay shows the payment methods available for this account and device, then returns you here after payment.</p>
        </>}
        <div className="test-payment-actions"><button type="button" disabled={checking} onClick={() => checkNow.current?.()}><RefreshCw size={16} aria-hidden="true" />{checking ? 'Checking payment…' : 'Check payment status'}</button></div>
        <p className="test-payment-waiting" role="status">We check automatically and when you return to this page. WhatsApp opens after verified payment. Your basket stays saved.</p>
      </div>}
      <dl className="test-payment-details">
        <div><dt>Order reference</dt><dd>{order.reference}</dd></div>
        <div><dt>Customer WhatsApp number</dt><dd>+{order.customerPhone}</dd></div>
        <div><dt>Total</dt><dd>{formatOrderPrice(order.amount / 100)}</dd></div>
        <div><dt>Order status</dt><dd>{ready ? 'Awaiting bakery confirmation' : terminal ? `Payment link ${order.status}` : 'Awaiting payment'}</dd></div>
        <div><dt>Payment status</dt><dd>{order.paymentStatus === 'paid' ? 'Payment successful · Razorpay Test Mode' : cash ? checkout.fulfilment === 'delivery' ? 'Unpaid · cash on delivery' : 'Unpaid · pay at pickup' : order.paymentStatus === 'pending' ? 'Verification pending' : 'Not paid'}</dd></div>
        {order.paymentId && <div><dt>Test payment reference</dt><dd>{order.paymentId}</dd></div>}
        {order.paymentStatus === 'paid' && paymentTime && <div><dt>{order.transactionAt ? 'Transaction time' : 'Payment verified at'}</dt><dd><time dateTime={timestamp}>{paymentTime}</time></dd></div>}
      </dl>
      {ready ? <>
        <p className="test-payment-confirmed" role="status"><Check size={20} aria-hidden="true" />{cash ? 'Your cash order request is saved. Payment is due on delivery or pickup.' : 'Your test payment is verified. Redirecting to WhatsApp with your order and payment details.'} Bakery acceptance is still pending.</p>
        <CustomerWhatsAppChat order={order} onNotice={setNotice} />
      </> : null}
      {terminal && <div className="test-payment-terminal"><p>This payment link has {order.status === 'expired' ? 'expired' : 'been cancelled'}. No successful payment has been verified.</p><button type="button" className="button test-payment-primary" onClick={() => { fresh.current = true; setRestart(value => value + 1) }}>Start a new test payment</button></div>}
    </>}
    <p className="test-payment-description">This is a demonstration. Online payments use Razorpay Test Mode; no real money or bakery delivery or pickup is booked.</p>
    {notice && <p className="test-payment-notice" role="status">{notice}</p>}
  </section>
}
