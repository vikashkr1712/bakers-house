import { Copy, ExternalLink, MessageCircle } from 'lucide-react'
import { customerWhatsAppChat } from '../utils/testPaymentLinks'

export default function CustomerWhatsAppChat({ order, onNotice }) {
  const chat = customerWhatsAppChat(order)
  if (!chat) return null

  async function copySummary() {
    try { await navigator.clipboard.writeText(chat.text); onNotice?.('Order summary copied. Paste it into the bakery’s WhatsApp chat and tap Send.') }
    catch { onNotice?.('Select and copy the order summary shown below, then paste it into WhatsApp.') }
  }

  return <div className="test-payment-chat">
    <p className="test-payment-chat-heading">Send your request to the bakery</p>
    <p>The prepared message is addressed to <strong>+{chat.number}</strong>. The bakery will reply in your WhatsApp conversation.</p>
    <a className="button test-payment-primary test-payment-whatsapp" href={chat.url}><MessageCircle size={19} aria-hidden="true" />Open WhatsApp again<ExternalLink size={17} aria-hidden="true" /></a>
    <p className="test-payment-chat-instructions"><strong>Tap Send in WhatsApp.</strong> We redirect automatically in this tab after saving a cash order or verifying an online payment. If you return here or your device prevents the redirect, use the button above. Opening a chat does not send the message or confirm bakery acceptance.</p>
    <button type="button" className="test-payment-send-again" onClick={copySummary}><Copy size={16} aria-hidden="true" />Copy order summary</button>
    <details className="test-payment-message-review" open><summary>Review your order message</summary><pre className="test-payment-summary" tabIndex={0} aria-label="Order summary">{chat.text}</pre></details>
  </div>
}
