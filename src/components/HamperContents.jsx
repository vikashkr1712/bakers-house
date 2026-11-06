import '../styles/hamper-basket.css'

export default function HamperContents({ product }) {
  if (!product?.hamperContents) return null
  return <div className="hamper-line-details">
    <p className="hamper-line-packaging"><strong>Inside each hamper</strong><span>{product.packaging.name}</span></p>
    <ul className="hamper-line-items" aria-label={`${product.name} contents`}>{product.hamperContents.map((line) => <li key={JSON.stringify([line.id, line.weight, line.flavour])}>{line.quantity} × {line.product.name}<span>{line.weight}{line.flavour && ` · ${line.flavour}`}</span></li>)}</ul>
    {product.giftMessage && <p className="hamper-line-message"><strong>Gift message</strong><span>{product.giftMessage}</span></p>}
  </div>
}
