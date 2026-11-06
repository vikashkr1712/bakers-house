const inspirationLabels = ['Serving inspiration', 'Craft inspiration', 'Gift box inspiration', 'Celebration inspiration', 'Ingredient inspiration', 'Texture inspiration']

const inspirationSubjects = {
  cakes: ['a plated cake slice', 'cake finishing by hand', 'a cake in a gift box', 'a cake celebration table', 'bakery ingredients', 'sponge and cream textures'],
  chocolates: ['chocolates on a serving plate', 'chocolate making by hand', 'an assorted chocolate gift box', 'a chocolate dessert table', 'cocoa ingredients', 'chocolate textures'],
  sweets: ['an assorted mithai serving plate', 'mithai making by hand', 'an assorted mithai gift box', 'a festive mithai table', 'nuts, dates and seeds', 'assorted mithai textures'],
}

// These shared context photographs are explicitly labelled inspiration samples.
// They do not claim to show additional angles or the recipe of an actual product.
export function buildProductGallery({ collection, name, image, alt }) {
  return [
    { src: image, alt, label: `${name} photograph`, generated: false },
    ...inspirationLabels.map((label, index) => ({
      src: `/images/bakery/gallery/${collection}-${String(index + 1).padStart(2, '0')}.webp`,
      alt: `Generated sample: ${inspirationSubjects[collection]?.[index] || label.toLowerCase()}`,
      label,
      generated: true,
    })),
  ]
}
