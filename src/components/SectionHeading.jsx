export default function SectionHeading({ eyebrow, title, description, children, align = 'center' }) {
  return <div className={`section-heading section-heading--${align}`}>
    <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{description && <p className="section-description">{description}</p>}</div>
    {children}
  </div>
}
