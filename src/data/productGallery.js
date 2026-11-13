import { cakePhotos } from './cakePhotos.js'

const inspirationLabels = ['Serving inspiration', 'Craft inspiration', 'Gift box inspiration', 'Celebration inspiration', 'Ingredient inspiration', 'Texture inspiration']

const inspirationSubjects = {
  chocolates: ['chocolates on a serving plate', 'chocolate making by hand', 'an assorted chocolate gift box', 'a chocolate dessert table', 'cocoa ingredients', 'chocolate textures'],
  sweets: ['an assorted mithai serving plate', 'mithai making by hand', 'an assorted mithai gift box', 'a festive mithai table', 'nuts, dates and seeds', 'assorted mithai textures'],
}

// These shared context photographs are labelled by their styling inspiration.
// They do not claim to show additional angles or the recipe of an actual product.
export function buildProductGallery({ collection, name, image, alt }) {
  if (collection === 'cakes') {
    const primary = Object.values(cakePhotos).find(photo => photo.src === image)
    const playful = ['sunnySmile', 'littleLion', 'daisySmile', 'vanillaSmile', 'blueHearts']
    const floral = ['pinkRosette', 'pinkHeart', 'greenFloral', 'redRosette', 'blueHearts']
    const designs = playful.some(key => cakePhotos[key].src === image) ? playful : floral
    return [
      { src: image, alt, label: `${name} — ${primary?.label || 'cake design'}`, generated: false },
      ...designs.map(key => cakePhotos[key]).filter(photo => photo.src !== image).map(photo => ({
        src: photo.src, alt: photo.alt, label: photo.label, inspiration: true, generated: false,
      })),
    ]
  }
  return [
    { src: image, alt, label: `${name} photograph`, generated: false },
    ...inspirationLabels.map((label, index) => ({
      src: `/images/bakery/gallery/${collection}-${String(index + 1).padStart(2, '0')}.webp`,
      alt: `Styling inspiration: ${inspirationSubjects[collection]?.[index] || label.toLowerCase()}`,
      label,
      generated: true,
    })),
  ]
}
