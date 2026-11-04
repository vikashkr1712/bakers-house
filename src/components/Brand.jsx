import { Wheat } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Brand({ onClick }) {
  return <Link className="brand" to="/#home" aria-label="Baker’s House home" onClick={onClick}>
    <Wheat className="brand-mark" strokeWidth={1.25} aria-hidden="true" />
    <span className="brand-type"><span className="brand-name">Baker’s House</span><span className="brand-tagline">Artisan Bakery</span></span>
  </Link>
}
