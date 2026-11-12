import { Copy, ExternalLink, MessageCircle } from 'lucide-react'
import { ORDERING_CONFIG } from '../config/ordering'
import { getWhatsAppUrl } from '../utils/whatsappOrder'

export default function CustomerWhatsAppChat({ order, onNotice }) {
  const number = ORDERING_CONFIG.whatsappNumber
  const url = getWhatsAppUrl(number, order.summary)

  async function copySummary() {
    try { await navigator.clipboard.writeText(order.summary); onNotice?.('Order message copied. Paste it into the bakery’s WhatsApp chat and tap Send.') }
    catch { onNotice?.('Select and copy the order message shown below, then paste it into WhatsApp.') }
  }

  return <div className="whatsapp-checkout-chat">
    <p className="whatsapp-checkout-chat-heading">Send your request to the bakery</p>
    <p>Your message is addressed to <strong>+{number}</strong>. The bakery will reply in your WhatsApp conversation.</p>
    <a className="button whatsapp-checkout-primary" href={url}><MessageCircle size={19} aria-hidden="true" />Open WhatsApp<ExternalLink size={17} aria-hidden="true" /></a>
    <p className="whatsapp-checkout-instructions"><strong>Tap Send in WhatsApp.</strong> If WhatsApp did not open, use the button above. Opening a chat does not send your message or confirm the order. Your basket stays available here.</p>
    {order.paymentMethod !== 'cod' && <p className="whatsapp-checkout-payment-help"><strong>After paying, attach your screenshot manually in this WhatsApp chat.</strong> The bakery checks receipt of the money before confirming payment; the website does not verify payments.</p>}
    <button type="button" className="whatsapp-checkout-copy" onClick={copySummary}><Copy size={16} aria-hidden="true" />Copy order message</button>
    <details className="whatsapp-checkout-message-review" open><summary>Review your order message</summary><pre className="whatsapp-checkout-summary" tabIndex={0} aria-label="Order message">{order.summary}</pre></details>
  </div>
}
