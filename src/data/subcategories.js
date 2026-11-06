export const sweetCollections = [
  {
    id: 'premium', name: 'Premium Mithai Collection',
    description: 'Kaju, pista, anjeer and gifting sweets.',
    subcategoryIds: ['barfi', 'peda', 'dry-fruit-sweets', 'gift-boxes'],
    aliases: ['premium mithai', 'premium-mithai'],
  },
  {
    id: 'healthy', name: 'Healthy Bites Collection',
    description: 'Nuts, dates, seeds and jaggery-based sweets.',
    subcategoryIds: ['laddu', 'dry-fruit-sweets', 'healthy-sweets', 'sugar-free-sweets'],
    aliases: ['healthy bites', 'healthy-bites'],
  },
  {
    id: 'desi', name: 'Desi Mithai Collection',
    description: 'Traditional Indian sweets.',
    subcategoryIds: ['laddu', 'barfi', 'peda', 'gulab-jamun', 'bengali-sweets', 'traditional-sweets', 'dry-fruit-sweets', 'halwa-desserts', 'jalebi-ghewar', 'gift-boxes'],
    aliases: ['traditional', 'traditional mithai', 'desi mithai', 'desi-mithai'],
  },
]

export const collectionSubcategories = {
  chocolates: [
    { id: 'milk', name: 'Milk Chocolate' },
    { id: 'dark', name: 'Dark Chocolate' },
    { id: 'nuts', name: 'Dry Fruit & Nuts' },
    { id: 'kids-special', name: 'Kids Special' },
    { id: 'assorted', name: 'Assorted Chocolates' },
  ],
  sweets: [
    { id: 'laddu', name: 'Laddu', typeLabel: 'Laddu type', allTypesLabel: 'All laddus', types: [
      { id: 'motichoor', name: 'Motichoor', aliases: ['motichur'], mithaiCollections: ['desi'] },
      { id: 'protein', name: 'Protein', mithaiCollections: ['healthy', 'desi'] },
      { id: 'dry-fruit-nuts', name: 'Dry Fruit & Nuts', mithaiCollections: ['premium', 'healthy', 'desi'] },
      { id: 'besan', name: 'Besan', mithaiCollections: ['desi'] },
      { id: 'jaggery', name: 'Jaggery', mithaiCollections: ['healthy', 'desi'] },
    ] },
    { id: 'barfi', name: 'Barfi', aliases: ['barfi & katli'], typeLabel: 'Barfi type', allTypesLabel: 'All barfi', types: [
      { id: 'kaju', name: 'Kaju Katli', mithaiCollections: ['premium', 'desi'] },
      { id: 'almond', name: 'Almond Barfi', mithaiCollections: ['premium', 'desi'] },
      { id: 'pista', name: 'Pista Barfi', mithaiCollections: ['premium', 'desi'] },
      { id: 'rose', name: 'Rose Barfi', mithaiCollections: ['premium', 'desi'] },
    ] },
    { id: 'peda', name: 'Peda', typeLabel: 'Peda type', allTypesLabel: 'All peda', types: [
      { id: 'kesar', name: 'Kesar Peda', mithaiCollections: ['premium', 'desi'] },
      { id: 'mathura', name: 'Mathura Peda', mithaiCollections: ['desi'] },
    ] },
    { id: 'gulab-jamun', name: 'Jamun', aliases: ['jamun', 'gulab jamun'], typeLabel: 'Jamun type', allTypesLabel: 'All jamun', types: [
      { id: 'gulab', name: 'Gulab Jamun', mithaiCollections: ['desi'] },
      { id: 'kala', name: 'Kala Jamun', mithaiCollections: ['desi'] },
    ] },
    { id: 'bengali-sweets', name: 'Bengali Sweets', aliases: ['bengali', 'rasgulla', 'rasugulla'], typeLabel: 'Bengali sweet type', allTypesLabel: 'All Bengali sweets', types: [
      { id: 'rasgulla', name: 'Rasgulla', aliases: ['rasugulla'], mithaiCollections: ['desi'] },
      { id: 'sandesh', name: 'Sandesh', mithaiCollections: ['desi'] },
    ] },
    { id: 'traditional-sweets', name: 'Traditional Sweets', aliases: ['traditional'], typeLabel: 'Traditional sweet type', allTypesLabel: 'All traditional sweets', types: [
      { id: 'soan-papdi', name: 'Soan Papdi', mithaiCollections: ['desi'] },
      { id: 'mysore-pak', name: 'Mysore Pak', mithaiCollections: ['desi'] },
    ] },
    { id: 'dry-fruit-sweets', name: 'Dry Fruit Sweets', aliases: ['dry-fruit', 'dry fruit'], typeLabel: 'Dry fruit sweet type', allTypesLabel: 'All dry fruit sweets', types: [
      { id: 'kaju', name: 'Kaju', mithaiCollections: ['premium', 'desi'] },
      { id: 'pista', name: 'Pista', mithaiCollections: ['premium', 'desi'] },
      { id: 'anjeer', name: 'Anjeer', mithaiCollections: ['premium', 'healthy', 'desi'] },
      { id: 'dry-fruit-nuts', name: 'Mixed Dry Fruit & Nuts', mithaiCollections: ['premium', 'healthy', 'desi'] },
    ] },
    { id: 'healthy-sweets', name: 'Healthy Sweets', typeLabel: 'Healthy sweet type', allTypesLabel: 'All healthy bites', types: [
      { id: 'dates-seeds', name: 'Dates & Seeds', mithaiCollections: ['healthy'] },
      { id: 'jaggery-nuts', name: 'Jaggery & Nuts', mithaiCollections: ['healthy'] },
      { id: 'protein-laddu', name: 'Protein Laddu', mithaiCollections: ['healthy'] },
    ] },
    { id: 'sugar-free-sweets', name: 'Sugar-Free Sweets', aliases: ['sugar-free', 'sugar free'], typeLabel: 'Sugar-free sweet type', allTypesLabel: 'All sugar-free selections', types: [
      { id: 'kaju', name: 'Sugar-Free Kaju Bites', mithaiCollections: ['healthy'] },
      { id: 'pista', name: 'Sugar-Free Pista Bites', mithaiCollections: ['healthy'] },
    ] },
    { id: 'halwa-desserts', name: 'Halwa & Desserts', aliases: ['halwa', 'halwa & desserts'], typeLabel: 'Halwa & dessert type', allTypesLabel: 'All halwa & desserts', types: [
      { id: 'moong-dal', name: 'Moong Dal Halwa', mithaiCollections: ['desi'] },
      { id: 'gajar', name: 'Gajar Halwa', mithaiCollections: ['desi'] },
    ] },
    { id: 'jalebi-ghewar', name: 'Jalebi & Ghewar', aliases: ['jalebi', 'ghewar', 'jalebi & ghewar'], typeLabel: 'Jalebi & ghewar type', allTypesLabel: 'All jalebi & ghewar', types: [
      { id: 'jalebi', name: 'Jalebi', mithaiCollections: ['desi'] },
      { id: 'ghewar', name: 'Ghewar', mithaiCollections: ['desi'] },
    ] },
    { id: 'gift-boxes', name: 'Gift Boxes', aliases: ['gift boxes'], typeLabel: 'Gift box type', allTypesLabel: 'All sweet gift boxes', types: [
      { id: 'premium', name: 'Premium Mithai Box', mithaiCollections: ['premium'] },
      { id: 'desi', name: 'Desi Mithai Box', mithaiCollections: ['desi'] },
    ] },
  ],
}

function optionValue(value) {
  return String(value?.id || value || '').trim().toLowerCase()
}

function findOption(options, value) {
  const requested = optionValue(value)
  return options.find(option => option.id === requested || option.name.toLowerCase() === requested || option.aliases?.includes(requested)) || null
}

export function getSweetCollection(value) {
  return findOption(sweetCollections, value)
}

export function getCollectionSubcategories(collection, mithai) {
  const options = collectionSubcategories[optionValue(collection)] || []
  const main = getSweetCollection(mithai)
  if (optionValue(collection) !== 'sweets' || !main) return options
  return options.filter(option => main.subcategoryIds.includes(option.id)).map(option => ({
    ...option,
    types: option.types?.filter(type => type.mithaiCollections.includes(main.id)),
  }))
}

export function getSubcategory(collection, value, mithai) {
  return findOption(getCollectionSubcategories(collection, mithai), value)
}

export function getSweetType(collection, subcategory, value, mithai) {
  const category = getSubcategory(collection, subcategory, mithai)
  // Old Rasgulla links now open Bengali Sweets with the Rasgulla type selected.
  const legacyType = ['rasgulla', 'rasugulla'].includes(optionValue(subcategory)) ? 'rasgulla' : ''
  return findOption(category?.types || [], value || legacyType)
}

export function resolveSweetCollection(value, subcategory, sweetType) {
  const explicit = getSweetCollection(value)
  if (explicit) return explicit
  const category = getSubcategory('sweets', subcategory)
  if (!category) return null
  const type = getSweetType('sweets', subcategory, sweetType)
  const preferred = ['healthy-sweets', 'sugar-free-sweets'].includes(category.id) || (category.id === 'laddu' && ['protein', 'jaggery'].includes(type?.id))
    ? ['healthy', 'desi', 'premium']
    : ['desi', 'premium', 'healthy']
  return preferred.map(id => getSweetCollection(id)).find(main => main.subcategoryIds.includes(category.id) && (!type || type.mithaiCollections.includes(main.id))) || null
}

export function matchesSubcategory(product, subcategory, sweetType, mithai) {
  const categoryId = optionValue(subcategory)
  const typeId = optionValue(sweetType)
  if (product.collection !== 'sweets') {
    return (!categoryId || product.subcategory === categoryId) && (!typeId || product.sweetType === typeId)
  }
  const category = getSubcategory('sweets', subcategory)
  const canonicalId = category?.id || categoryId
  const type = getSweetType('sweets', subcategory, sweetType)
  const canonicalType = type?.id || typeId
  const main = getSweetCollection(mithai)
  const categories = product.sweetCategories || [getSubcategory('sweets', product.subcategory)?.id || product.subcategory]
  const matchesMain = !main || product.mithaiCollections?.includes(main.id)
  const matchesCategory = !canonicalId || categories.includes(canonicalId)
  const productType = product.sweetTypes?.[canonicalId] || product.sweetType
  return Boolean(matchesMain && matchesCategory && (!canonicalType || productType === canonicalType))
}
