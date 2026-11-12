// HashRouter owns the URL hash. Keep in-page links as scrolling
// actions so anchors such as #categories cannot replace the current app route.
export function handleHashAnchor(event) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const anchor = event.target?.closest?.('a[href^="#"]')
  const href = anchor?.getAttribute('href')
  if (!href || href.length < 2 || href.startsWith('#/') || anchor.target === '_blank') return
  const target = document.getElementById(href.slice(1))
  if (!target) return
  event.preventDefault()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' })
  if (target.hasAttribute('tabindex')) target.focus({ preventScroll: true })
}
