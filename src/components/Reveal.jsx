import { motion, useReducedMotion } from 'motion/react'

const offsets = {
  left: { x: -48, y: 0 },
  right: { x: 48, y: 0 },
  up: { x: 0, y: 24 },
}

export default function Reveal({ children, className = '', delay = 0, direction = 'up', amount = 0.35 }) {
  const reduced = useReducedMotion()
  return <motion.div className={`scroll-reveal ${className}`} initial={reduced ? false : { opacity: 0, ...offsets[direction] }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true, amount }} transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
}
