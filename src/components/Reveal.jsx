import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

const offsets = {
  left: { x: -48, y: 0 },
  right: { x: 48, y: 0 },
  up: { x: 0, y: 24 },
}

export default function Reveal({ children, className = '', delay = 0, direction = 'up', amount = 0.35, as = 'div', observeParent = false }) {
  const reduced = useReducedMotion()
  const elementRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (reduced) return
    const element = observeParent ? elementRef.current?.parentElement : elementRef.current
    if (!element) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    let active = true
    let entered = false
    let imagesReady
    function reveal() {
      const images = [...elementRef.current.querySelectorAll('img')]
      if (images.every((image) => image.complete && image.naturalWidth > 0)) {
        setVisible(true)
        return
      }
      imagesReady ||= Promise.all(images.map((image) => {
        image.loading = 'eager'
        return image.decode().catch(() => {})
      }))
      imagesReady.then(() => { if (active && entered) setVisible(true) })
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!active) return
      if (entry.isIntersecting && entry.intersectionRatio >= amount) {
        entered = true
        reveal()
      }
      // Reset only after leaving the screen, avoiding flicker near the entrance threshold.
      else if (!entry.isIntersecting) {
        entered = false
        setVisible(false)
      }
    }, { threshold: [0, amount] })
    observer.observe(element)
    return () => { active = false; observer.disconnect() }
  }, [amount, observeParent, reduced])

  const show = reduced || visible
  const hidden = { opacity: 0, ...offsets[direction] }
  const Element = as === 'span' ? motion.span : motion.div
  return <Element
    ref={elementRef}
    className={`scroll-reveal ${className}`}
    initial={reduced ? false : hidden}
    animate={show ? { opacity: 1, x: 0, y: 0 } : hidden}
    transition={{ duration: reduced || !show ? 0 : 1.35, delay: reduced || !show ? 0 : delay, ease: [0.25, 0.46, 0.45, 0.94] }}
  >{children}</Element>
}
