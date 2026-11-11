import { useState } from 'react'
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react'
import Dialog from './Dialog'
import { REQUESTS_STORAGE_KEY } from '../utils/whatsappOrder'
import { forgetTestOrder } from '../utils/testPaymentLinks'
import BasketDrawer from './BasketDrawer'
import HamperContents from './HamperContents'

function ProductDetail({ product, onAdd, onBack, backLabel }) {
  const [added, setAdded] = useState(false)
  return <div className="product-detail"><button className="text-link product-back" onClick={onBack}><ArrowLeft size={16} />{backLabel}</button><div className="product-detail-grid"><img className="product-detail-image" src={product.image} alt={product.alt} width="640" height="720" /><div className="product-detail-copy"><p className="eyebrow">{product.category}</p><h3>{product.name}</h3><p className="product-detail-note">{product.note}</p><p>{product.description}</p><HamperContents product={product} /><span className="short-rule" /><button className="button button--gold" onClick={() => { onAdd(product); setAdded(true) }}>{added ? 'Add another' : 'Add to basket'}{added ? <Check size={17} /> : <Plus size={17} />}</button><p className="demo-note">Your selection is saved in your basket on this device.</p><p className="allergen-note">Please confirm ingredients and allergens with the bakery before ordering.</p></div></div></div>
}

export default function ShopDialogs({ view, setView, basket, onAdd, onShop, onProductBack, productBackLabel = 'Back to the bakery' }) {
  const close = () => setView(null)
  const openShop = () => onShop('All')
  const titles = { basket: `Your Basket (${basket.count})`, product: 'From our bakery', privacy: 'Your privacy' }
  if (!view) return null
  return <Dialog key={view.type} title={titles[view.type]} onClose={close} className={`dialog--${view.type}`}>
    {view.type === 'basket' && <BasketDrawer basket={basket} onShop={openShop} />}
    {view.type === 'product' && <ProductDetail key={view.product.id} product={view.product} onAdd={(product) => product.hamper ? basket.addHamper(product.hamper) : onAdd(product)} onBack={onProductBack} backLabel={productBackLabel} />}
    {view.type === 'privacy' && <div className="editorial-dialog"><p className="eyebrow">SIMPLE AND TRANSPARENT</p><h3>Your device.<br />Your little collection.</h3><p>Your basket, cake preferences and messages, hamper draft and any email saved for later stay in this browser. Test checkout details and a private order-access token are saved in this browser’s session storage so an unfinished payment can resume.</p><p>When you place a cash order or pay online, your name, WhatsApp number, selection, address and requested slot are sent to the order server and saved privately in its database. For online payment only, the server sends the amount, reference, name and contact number to Razorpay to create your test payment link. Card or bank details are entered on Razorpay’s own checkout. Cash orders do not contact Razorpay.</p><p>After a cash order is saved or a successful online payment is verified, WhatsApp opens with your full order summary addressed to the bakery. The message includes your contact and collection details, customisations, total and payment status. You must tap Send. A click-to-chat link cannot tell this website whether you sent the message or whether the bakery accepted your request. The bakery replies in WhatsApp.</p><p>Only Razorpay Test Mode is enabled. No real money is charged or bakery fulfilment booked. The server verifies online payment before preparing a paid order message. Payment success and bakery acceptance are separate; the bakery confirms or declines in WhatsApp. There are no analytics or tracking cookies added by this website.</p><button className="button button--gold" onClick={() => { basket.clear(); forgetTestOrder(); try { localStorage.removeItem('bakers-house-newsletter-demo'); localStorage.removeItem('bakers-house-hamper-draft-v1'); localStorage.removeItem(REQUESTS_STORAGE_KEY); sessionStorage.removeItem('bakers-house-test-checkout-v1') } catch { /* No saved browser data can be removed if storage is disabled. */ } close() }}>Clear saved data<Trash2 size={16} /></button><p>Clear saved data removes browser data. Test orders stored on the local server are retained separately.</p></div>}
  </Dialog>
}
