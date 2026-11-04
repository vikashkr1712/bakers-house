import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Dialog({ title, onClose, children, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement
    const originalOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = originalOverflow
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true })
    }
  }, [])
  return <dialog ref={ref} className={`dialog ${className}`} aria-labelledby="dialog-title" onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => {
    if (event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
  }}><div className="dialog-header"><h2 id="dialog-title">{title}</h2><button className="icon-button dialog-close" onClick={onClose} aria-label="Close dialog" autoFocus><X size={23} strokeWidth={1.5} /></button></div>{children}</dialog>
}
