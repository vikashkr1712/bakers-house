export function focusContactPage() {
  const heading = document.getElementById('contact-title')
  if (!heading) return
  window.scrollTo({ top: 0, behavior: 'instant' })
  heading.focus({ preventScroll: true })
}
