import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { formatOrderPrice } from '../utils/whatsappOrder'
import CustomerWhatsAppChat from './CustomerWhatsAppChat'
import '../styles/whatsapp-checkout.css'

export default function OrderCheckout({ order }) {
  const [notice, setNotice] = useState('')
  const cash = order.paymentMethod === 'cod'

  return <section className="whatsapp-checkout" aria-labelledby="order-checkout-title">
    <span className="whatsapp-checkout-mode"><MessageCircle size={15} aria-hidden="true" />CONTINUE YOUR ORDER IN WHATSAPP</span>
    <h2 id="order-checkout-title" tabIndex={-1}>Your order message is ready.</h2>
    <p className="whatsapp-checkout-description">{cash
      ? `Send your order to the bakery and pay ${order.fulfilment === 'delivery' ? 'on delivery' : 'at pickup'}. The bakery will confirm availability and your requested slot in chat.`
      : 'Send your order to the bakery, ask for payment details and the final amount, then make the payment yourself. Send your payment screenshot in the same WhatsApp chat for the bakery to verify.'}</p>
    <dl className="whatsapp-checkout-details">
      <div><dt>Request reference</dt><dd>{order.reference}</dd></div>
      <div><dt>Your WhatsApp number</dt><dd>{order.fields.phone}</dd></div>
      <div><dt>Estimated total</dt><dd>{formatOrderPrice(order.totals.total)}</dd></div>
      <div><dt>Payment preference</dt><dd>{order.paymentLabel}</dd></div>
      <div><dt>Payment status</dt><dd>{cash ? `Unpaid · ${order.fulfilment === 'delivery' ? 'cash on delivery' : 'pay at pickup'}` : 'Not verified · bakery checks payment in WhatsApp'}</dd></div>
    </dl>
    <CustomerWhatsAppChat order={order} onNotice={setNotice} />
    {notice && <p className="whatsapp-checkout-notice" role="status">{notice}</p>}
  </section>
}
