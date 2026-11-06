import { useState } from 'react'
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react'
import Dialog from './Dialog'
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
    {view.type === 'privacy' && <div className="editorial-dialog"><p className="eyebrow">SIMPLE AND TRANSPARENT</p><h3>Your device.<br />Your little collection.</h3><p>Your basket, hamper selections and gift messages, saved hamper draft, and any email you save here stay in your browser’s local storage. They are not sent to a server.</p><p>There are no analytics or tracking cookies. Payments and live order submission are not connected. Photography and fonts are hosted locally.</p><button className="button button--gold" onClick={() => { basket.clear(); try { localStorage.removeItem('bakers-house-newsletter-demo'); localStorage.removeItem('bakers-house-hamper-draft-v1') } catch { /* No saved data if storage is disabled. */ } close() }}>Clear saved data<Trash2 size={16} /></button></div>}
  </Dialog>
}
