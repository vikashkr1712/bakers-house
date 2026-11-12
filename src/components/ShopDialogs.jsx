import { useState } from 'react'
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react'
import Dialog from './Dialog'
import { REQUESTS_STORAGE_KEY } from '../utils/whatsappOrder'
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
    {view.type === 'privacy' && <div className="editorial-dialog"><p className="eyebrow">SIMPLE AND TRANSPARENT</p><h3>Your device.<br />Your little collection.</h3><p>Your basket, cake preferences and messages, hamper draft and any email saved for later stay in this browser. Checkout details are used in this browser to prepare your order message. This checkout does not save orders to a website database or send your details to a payment gateway.</p><p>When you continue to WhatsApp, your order summary is included in a WhatsApp click-to-chat link. It contains the name and contact details you entered, your selection, delivery address or pickup store, requested slot, instructions, estimated total and payment choice. WhatsApp opens with this message prepared for the bakery. You must tap Send yourself.</p><p>For cash on delivery or payment at pickup, payment remains due. For online payment via WhatsApp, ask the bakery for payment details, pay separately and attach your screenshot in the chat. The bakery must verify that the money was received before confirming payment. The website cannot verify a payment, attach a screenshot, detect whether you sent the message or confirm that the bakery accepted your request.</p><p>The bakery replies in your WhatsApp conversation to confirm availability, final pricing and your order. There are no analytics or tracking cookies added by this website.</p><button className="button button--gold" onClick={() => { basket.clear(); try { localStorage.removeItem('bakers-house-newsletter-demo'); localStorage.removeItem('bakers-house-hamper-draft-v1'); localStorage.removeItem(REQUESTS_STORAGE_KEY); sessionStorage.removeItem('bakers-house-test-checkout-v1'); sessionStorage.removeItem('bakers-house-checkout-order-v2'); sessionStorage.removeItem('bakers-house-whatsapp-checkout-v1') } catch { /* No saved browser data can be removed if storage is disabled. */ } close() }}>Clear saved data<Trash2 size={16} /></button><p>Clear saved data removes this website’s saved browser data. It does not delete messages, attachments or payments you have shared outside the website.</p></div>}
  </Dialog>
}
