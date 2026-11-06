import { getSubcategory, getSweetCollection, getSweetType } from './subcategories.js'
import { buildProductGallery } from './productGallery.js'

const image = (name) => `/images/bakery/redesign/${name}.webp`

export const cakeCategories = [
  { id: 'birthday', name: 'Birthday Cake', heading: 'Birthday Cakes', image: image('cake-birthday'), alt: 'White buttercream cake decorated with colourful sprinkles' },
  { id: 'anniversary', name: 'Anniversary Cake', heading: 'Anniversary Cakes', image: image('cake-anniversary'), alt: 'White celebration cake decorated with white and blue flowers' },
  { id: 'kids', name: 'Kids Special', heading: 'Kids Special Cakes', image: image('cake-kids'), alt: 'Round white cake covered with colourful rainbow sprinkles' },
  { id: 'party', name: 'Party Cake', heading: 'Party Cakes', image: image('cake-party'), alt: 'Rustic tiered celebration cake decorated with pastries and flowers' },
  { id: 'baby-shower', name: 'Baby Shower Cake', heading: 'Baby Shower Cakes', image: image('cake-baby-shower'), alt: 'White baby shower cake surrounded by blue and yellow balloons' },
]

function cake({ slug, name, tags, photo, alt, note, description, price, flavours, rank, bestseller = false, available = true }) {
  const gallery = buildProductGallery({ collection: 'cakes', name, image: image(photo), alt })
  const largeUnit = price * 3 - 148
  return {
    id: `cake-${slug}`, slug, name, category: 'Cakes & Pastries', collection: 'cakes', tags,
    description, note, image: image(photo), images: gallery.map(item => item.src), gallery, alt, price,
    weights: [{ label: '500 g', price }, { label: '1 kg', price: price * 2 - 99 }, { label: '1.5 kg', price: largeUnit }, ...[2, 3, 4, 5].map(kg => ({ label: `${kg} kg`, price: Math.round(largeUnit * kg / 1.5) }))],
    flavours, bestseller, bestsellerRank: rank, available, detailPath: `/cakes/${slug}`,
  }
}

// Editorial order for a balanced collection; these ranks do not represent sales figures.
export const cakeProducts = [
  cake({ slug: 'birthday-confetti', name: 'Birthday Confetti', tags: ['Birthday Cake', 'Kids Special'], photo: 'cake-birthday', alt: 'A birthday celebration cake with colourful decorations', note: 'A little colour. A lot of joy.', description: 'Soft vanilla sponge layered with smooth vanilla cream and a cheerful finish. A joyful centrepiece for candle wishes and birthday smiles.', price: 749, flavours: ['Vanilla'], rank: 1, bestseller: true }),
  cake({ slug: 'velvet-romance', name: 'Floral Romance', tags: ['Anniversary Cake'], photo: 'cake-anniversary', alt: 'White celebration cake decorated with white and blue flowers', note: 'For a love worth celebrating.', description: 'Tender sponge and delicately whipped cream, finished with a little romance. Made for anniversaries, milestones and moments shared by two.', price: 899, flavours: ['Vanilla', 'Chocolate'], rank: 2, bestseller: true }),
  cake({ slug: 'little-wonder', name: 'Little Wonder', tags: ['Baby Shower Cake'], photo: 'cake-baby-shower', alt: 'A delicate celebration cake with a soft decorative finish', note: 'Sweet beginnings, beautifully celebrated.', description: 'Light vanilla sponge and silky cream in a gently decorated cake. A lovely addition to a gathering for the newest little arrival.', price: 949, flavours: ['Vanilla'], rank: 3, bestseller: true }),
  cake({ slug: 'rustic-celebration', name: 'Rustic Celebration', tags: ['Party Cake', 'Birthday Cake'], photo: 'cake-party', alt: 'Rustic tiered celebration cake decorated with pastries, flowers and a 70 topper', note: 'Bring everyone a little closer.', description: 'A celebration cake with soft vanilla sponge and a rustic cream finish. Slice, share and make a little more of your next gathering.', price: 849, flavours: ['Vanilla'], rank: 4, bestseller: true }),
  cake({ slug: 'happy-little-cake', name: 'Happy Little Cake', tags: ['Kids Special', 'Birthday Cake'], photo: 'cake-kids', alt: 'A playful cake with bright celebration decorations', note: 'Made for the biggest little smiles.', description: 'Fluffy vanilla sponge with a creamy filling and a playful finish. An extra happy cake for little celebrations and big imaginations.', price: 849, flavours: ['Vanilla'], rank: 5, bestseller: true }),
  cake({ slug: 'strawberry-cloud', name: 'Strawberry Cloud', tags: ['Birthday Cake', 'Anniversary Cake'], photo: 'cake-strawberry', alt: 'A cream cake finished with strawberries', note: 'Berries, cream and happy moments.', description: 'Layers of soft sponge and strawberry cream, finished with a fresh, berry-inspired touch. Bright, light and lovely to share.', price: 799, flavours: ['Strawberry'], rank: 6 }),
  cake({ slug: 'floral-daydream', name: 'Floral Daydream', tags: ['Baby Shower Cake', 'Anniversary Cake'], photo: 'cake-floral', alt: 'A celebration cake with delicate floral decoration', note: 'A delicate flourish for your day.', description: 'A softly finished vanilla cake with an elegant floral design. A thoughtful centrepiece for intimate celebrations and new beginnings.', price: 999, flavours: ['Vanilla'], rank: 7 }),
  cake({ slug: 'midnight-chocolate', name: 'Midnight Chocolate', tags: ['Party Cake', 'Birthday Cake'], photo: 'cake-chocolate', alt: 'A rich chocolate cake with a chocolate finish', note: 'For the devoted chocolate lover.', description: 'Rich cocoa sponge meets smooth chocolate cream in a deeply indulgent cake. Enjoy a generous slice with your favourite people.', price: 899, flavours: ['Chocolate'], rank: 8 }),
  cake({ slug: 'classic-cream', name: 'Classic Cream', tags: ['Birthday Cake', 'Baby Shower Cake'], photo: 'cake-cream', alt: 'A simply decorated cake with a light cream finish', note: 'Simple, soft and a little special.', description: 'A timeless combination of light sponge and whipped vanilla cream. Understated, beautifully finished and at home at any celebration.', price: 699, flavours: ['Vanilla'], rank: 9 }),
  cake({ slug: 'red-velvet-affair', name: 'Red Velvet Affair', tags: ['Anniversary Cake', 'Party Cake'], photo: 'cake-red-velvet', alt: 'A red velvet cake with a cream finish', note: 'A classic with a romantic heart.', description: 'Velvety cocoa sponge layered with a smooth cream-cheese-style frosting. A rich, tender finish for evenings worth remembering.', price: 949, flavours: ['Red Velvet'], rank: 10 }),
]

// A sweet can appear in more than one relevant collection without duplicating its product or price.
const sweetTaxonomy = {
  'kaju-katli': { collections: ['premium', 'desi'], types: { barfi: 'kaju', 'dry-fruit-sweets': 'kaju' } },
  'gulab-jamun': { collections: ['desi'], types: { 'gulab-jamun': 'gulab' } },
  rasgulla: { collections: ['desi'], types: { 'bengali-sweets': 'rasgulla' } },
  'motichoor-laddu': { collections: ['desi'], types: { laddu: 'motichoor' } },
  'almond-barfi': { collections: ['premium', 'desi'], types: { barfi: 'almond' } },
  'protein-laddu': { collections: ['healthy', 'desi'], types: { laddu: 'protein', 'healthy-sweets': 'protein-laddu' } },
  'dry-fruit-nuts-laddu': { collections: ['premium', 'healthy', 'desi'], types: { laddu: 'dry-fruit-nuts', 'dry-fruit-sweets': 'dry-fruit-nuts' } },
  'pista-barfi': { collections: ['premium', 'desi'], types: { barfi: 'pista', 'dry-fruit-sweets': 'pista' } },
  'rose-barfi': { collections: ['premium', 'desi'], types: { barfi: 'rose' } },
  'anjeer-bites': { collections: ['premium', 'healthy', 'desi'], types: { 'dry-fruit-sweets': 'anjeer' } },
  'kesar-peda': { collections: ['premium', 'desi'], types: { peda: 'kesar' } },
  'mathura-peda': { collections: ['desi'], types: { peda: 'mathura' } },
  'kala-jamun': { collections: ['desi'], types: { 'gulab-jamun': 'kala' } },
  sandesh: { collections: ['desi'], types: { 'bengali-sweets': 'sandesh' } },
  'soan-papdi': { collections: ['desi'], types: { 'traditional-sweets': 'soan-papdi' } },
  'mysore-pak': { collections: ['desi'], types: { 'traditional-sweets': 'mysore-pak' } },
  'dates-seeds-bites': { collections: ['healthy'], types: { 'healthy-sweets': 'dates-seeds' } },
  'jaggery-nut-bites': { collections: ['healthy'], types: { 'healthy-sweets': 'jaggery-nuts' } },
  'sugar-free-kaju-bites': { collections: ['healthy'], types: { 'sugar-free-sweets': 'kaju' } },
  'sugar-free-pista-bites': { collections: ['healthy'], types: { 'sugar-free-sweets': 'pista' } },
  'moong-dal-halwa': { collections: ['desi'], types: { 'halwa-desserts': 'moong-dal' } },
  'gajar-halwa': { collections: ['desi'], types: { 'halwa-desserts': 'gajar' } },
  jalebi: { collections: ['desi'], types: { 'jalebi-ghewar': 'jalebi' } },
  ghewar: { collections: ['desi'], types: { 'jalebi-ghewar': 'ghewar' } },
  'premium-mithai-box': { collections: ['premium'], types: { 'gift-boxes': 'premium' } },
  'desi-mithai-box': { collections: ['desi'], types: { 'gift-boxes': 'desi' } },
  'besan-laddu': { collections: ['desi'], types: { laddu: 'besan' } },
  'jaggery-laddu': { collections: ['healthy', 'desi'], types: { laddu: 'jaggery' } },
}

function confection({ slug, name, collection, subcategory, sweetType, photo, alt, note, description, price, flavour, rank, bestseller = false, imageNote }) {
  const category = getSubcategory(collection, subcategory)
  const type = getSweetType(collection, category, sweetType)
  const taxonomy = collection === 'sweets' ? sweetTaxonomy[slug] : null
  const sweetTags = taxonomy ? [
    ...taxonomy.collections.map(id => getSweetCollection(id)?.name),
    ...Object.entries(taxonomy.types).flatMap(([categoryId, typeId]) => [
      getSubcategory('sweets', categoryId)?.name,
      getSweetType('sweets', categoryId, typeId)?.name,
    ]),
  ] : []
  const gallery = buildProductGallery({ collection, name, image: image(photo), alt })
  const halfKiloPrice = price * 2 - 49
  return {
    id: `${collection}-${slug}`, slug, name, collection, subcategory: collection === 'sweets' ? subcategory : category?.id, sweetType: type?.id,
    ...(taxonomy ? { sweetCategories: Object.keys(taxonomy.types), sweetTypes: taxonomy.types, mithaiCollections: taxonomy.collections } : {}),
    category: collection === 'chocolates' ? 'Chocolates' : 'Sweets',
    tags: taxonomy ? [...new Set(sweetTags.filter(Boolean))] : ['Chocolate Collection', category?.name, type?.name].filter(Boolean),
    image: image(photo), images: gallery.map(item => item.src), gallery, alt, note, description, price,
    ...(imageNote ? { imageNote } : {}),
    weights: [{ label: '250 g', price }, { label: '500 g', price: halfKiloPrice }, ...[1, 1.5, 2, 3, 4, 5].map(kg => ({ label: `${kg} kg`, price: Math.round(halfKiloPrice * kg * 2) }))],
    flavours: [flavour], available: true, bestseller, bestsellerRank: rank,
    detailPath: `/products/${slug}`,
  }
}

export const chocolateProducts = [
  confection({ slug: 'signature-truffles', subcategory: 'dark', name: 'Signature Truffles', collection: 'chocolates', photo: 'chocolate-truffles', alt: 'A selection of rich chocolate truffles', note: 'Small bites of pure indulgence.', description: 'Smooth chocolate centres wrapped in a delicate cocoa finish. A thoughtful gift or a quietly indulgent moment of your own.', price: 549, flavour: 'Dark Chocolate', rank: 1, bestseller: true }),
  confection({ slug: 'nut-chocolate-bars', subcategory: 'nuts', name: 'Nut Chocolate Bars', collection: 'chocolates', photo: 'chocolate-nut-bars', alt: 'Handmade chocolate bars topped with nuts and coconut flakes', note: 'A little crunch. A lot to love.', description: 'Rich chocolate bars finished with nuts and coconut flakes. Break, share and enjoy a little everyday sweetness.', price: 449, flavour: 'Nut & Coconut', rank: 2, bestseller: true }),
  confection({ slug: 'chocolate-pralines', subcategory: 'nuts', name: 'Chocolate Pralines', collection: 'chocolates', photo: 'chocolate-pralines', alt: 'A collection of individually crafted chocolate pralines', note: 'A box of little discoveries.', description: 'Delicate chocolate shells with a soft centre, made for gifting and sharing. Each bite brings a little something special to the table.', price: 649, flavour: 'Hazelnut Chocolate', rank: 3 }),
  confection({ slug: 'dark-chocolate-bites', subcategory: 'dark', name: 'Dark Chocolate Bites', collection: 'chocolates', photo: 'chocolate-dark', alt: 'Rich dark chocolate pieces', note: 'Deep cocoa. A smooth finish.', description: 'Rich dark chocolate in easy-to-share pieces. Enjoy slowly with a warm cup of coffee or bring a little indulgence to a gift box.', price: 499, flavour: 'Dark Chocolate', rank: 4 }),
  confection({ slug: 'chocolate-gift-box', subcategory: 'assorted', name: 'Chocolate Gift Box', collection: 'chocolates', photo: 'chocolate-gift-box', alt: 'Assorted gourmet chocolate pralines arranged in a gift box', note: 'A little of everything you love.', description: 'An inviting assortment of chocolates for celebrations, thoughtful gifts and shared sweet moments.', price: 699, flavour: 'Assorted Chocolate', rank: 5 }),
  confection({ slug: 'milk-chocolate-squares', name: 'Milk Chocolate Squares', collection: 'chocolates', subcategory: 'milk', photo: 'chocolate-pralines', alt: 'A box of chocolate pralines with decorative toppings', note: 'Creamy chocolate. Simple pleasures.', description: 'A smooth milk-chocolate selection for thoughtful gifts and everyday treats. A little sweetness to share with your favourite people.', price: 399, flavour: 'Milk Chocolate', rank: 6 }),
  confection({ slug: 'kids-chocolate-treats', name: 'Kids Chocolate Treats', collection: 'chocolates', subcategory: 'kids-special', photo: 'chocolate-gift-box', alt: 'An assortment of chocolates arranged in a gift box', note: 'Little treats for happy moments.', description: 'A cheerful milk-chocolate selection for little celebrations and thoughtful surprises. Please confirm ingredients and allergens before gifting.', price: 349, flavour: 'Milk Chocolate', rank: 7 }),

]

// These extra recipes make the catalogue preview usable until the shop confirms its range.
// Existing sweets photographs are representative; they are not presented as exact photos of new recipes.
function illustrativeSweet(details) {
  return {
    ...confection({
      ...details, collection: 'sweets',
      description: `${details.description} Sample catalogue selection; please confirm the recipe, ingredients and availability before ordering.`,
      imageNote: 'Representative sweets photograph; the pictured recipe may differ.',
    }),
    illustrative: true,
  }
}

export const sweetProducts = [
  confection({ slug: 'kaju-katli', subcategory: 'barfi', name: 'Kaju Katli', collection: 'sweets', photo: 'sweet-kaju-katli', alt: 'Diamond-shaped pieces of traditional kaju katli', note: 'A timeless celebration favourite.', description: 'Fine cashew sweetness with a delicate, melt-in-the-mouth finish. A classic addition to festivals, family visits and thoughtful gifts.', price: 349, flavour: 'Cashew', rank: 1, bestseller: true }),
  confection({ slug: 'gulab-jamun', subcategory: 'gulab-jamun', name: 'Gulab Jamun', collection: 'sweets', photo: 'sweet-gulab-jamun', alt: 'Golden-brown gulab jamun in a sweet syrup', note: 'Comfort in every sweet spoonful.', description: 'Soft, golden dumplings in fragrant sugar syrup. Serve gently warmed for a familiar finish to a gathering around the table.', price: 249, flavour: 'Classic', rank: 2, bestseller: true }),
  confection({ slug: 'rasgulla', subcategory: 'rasgulla', name: 'Rasgulla', collection: 'sweets', photo: 'sweet-rasgulla', alt: 'Soft white rasgulla in a light syrup', note: 'Soft, light and wonderfully sweet.', description: 'Delicate chhena dumplings soaked in a light sugar syrup. A refreshing, familiar sweet for festive tables and everyday treats.', price: 229, flavour: 'Classic', rank: 3 }),
  confection({ slug: 'motichoor-laddu', subcategory: 'laddu', sweetType: 'motichoor', name: 'Motichoor Laddu', collection: 'sweets', photo: 'sweet-laddu', alt: 'Traditional golden-orange motichoor laddus', note: 'Little golden moments of joy.', description: 'Fine pearls of sweet boondi brought together in a soft, fragrant laddu. A much-loved companion to celebrations big and small.', price: 279, flavour: 'Classic', rank: 4 }),
  confection({ slug: 'almond-barfi', subcategory: 'barfi', name: 'Almond Barfi', collection: 'sweets', photo: 'sweet-almond-barfi', alt: 'Traditional almond barfi decorated with nuts', note: 'A little taste of tradition.', description: 'A rich almond sweet with a soft, delicate bite and a nutty finish. Simple, comforting and made for the moments you want to share.', price: 349, flavour: 'Almond', rank: 5 }),
  confection({ slug: 'protein-laddu', name: 'Protein Laddu', collection: 'sweets', subcategory: 'laddu', sweetType: 'protein', photo: 'sweet-laddu', alt: 'Golden round laddus arranged together for serving', note: 'A nutty take on a familiar favourite.', description: 'A nutty laddu option for everyday gifting and a little something sweet. Please confirm ingredients and nutritional information before ordering.', price: 349, flavour: 'Oats, Nuts & Seeds', rank: 6 }),
  confection({ slug: 'dry-fruit-nuts-laddu', name: 'Dry Fruit & Nuts Laddu', collection: 'sweets', subcategory: 'laddu', sweetType: 'dry-fruit-nuts', photo: 'sweet-laddu', alt: 'Round laddus presented together on a serving plate', note: 'A little richness in every bite.', description: 'A laddu inspired by the richness of nuts and dried fruit. A thoughtful addition to festive gifts and moments shared around the table.', price: 399, flavour: 'Dry Fruit & Nuts', rank: 7 }),
  illustrativeSweet({ slug: 'pista-barfi', name: 'Pista Barfi', subcategory: 'barfi', sweetType: 'pista', photo: 'sweet-almond-barfi', alt: 'Representative photograph of nut-topped barfi pieces', note: 'Pistachio-inspired festive sweetness.', description: 'A pista barfi selection for sharing and adding to a premium mithai gift.', price: 399, flavour: 'Pistachio', rank: 8 }),
  illustrativeSweet({ slug: 'rose-barfi', name: 'Rose Barfi', subcategory: 'barfi', sweetType: 'rose', photo: 'sweet-rose-barfi', alt: 'Rose-coloured barfi pieces presented for serving', note: 'A soft floral touch.', description: 'A rose-inspired barfi selection for festive tables and thoughtful little gifts.', price: 329, flavour: 'Rose', rank: 9 }),
  illustrativeSweet({ slug: 'anjeer-bites', name: 'Anjeer Bites', subcategory: 'dry-fruit-sweets', sweetType: 'anjeer', photo: 'sweet-kaju-katli', alt: 'Representative photograph of diamond-shaped mithai pieces', note: 'Fig and nut-inspired little bites.', description: 'An anjeer and nut-inspired selection for the dry fruit sweets collection.', price: 429, flavour: 'Fig & Nuts', rank: 10 }),
  illustrativeSweet({ slug: 'kesar-peda', name: 'Kesar Peda', subcategory: 'peda', sweetType: 'kesar', photo: 'sweet-almond-barfi', alt: 'Representative photograph of traditional nut-topped mithai', note: 'A little saffron-inspired celebration.', description: 'A kesar peda selection with a traditional milk-sweet character.', price: 299, flavour: 'Saffron', rank: 11 }),
  illustrativeSweet({ slug: 'mathura-peda', name: 'Mathura Peda', subcategory: 'peda', sweetType: 'mathura', photo: 'sweet-almond-barfi', alt: 'Representative photograph of traditional mithai arranged together', note: 'A familiar desi favourite.', description: 'A Mathura-style peda selection for a classic Indian sweets box.', price: 279, flavour: 'Classic Milk', rank: 12 }),
  illustrativeSweet({ slug: 'kala-jamun', name: 'Kala Jamun', subcategory: 'gulab-jamun', sweetType: 'kala', photo: 'sweet-gulab-jamun', alt: 'Representative photograph of syrup-soaked jamun sweets', note: 'A rich syrup-soaked favourite.', description: 'A kala jamun selection to explore alongside classic gulab jamun.', price: 269, flavour: 'Classic', rank: 13 }),
  illustrativeSweet({ slug: 'sandesh', name: 'Sandesh', subcategory: 'bengali-sweets', sweetType: 'sandesh', photo: 'sweet-rasgulla', alt: 'Representative photograph of white Bengali chhena sweets', note: 'A little Bengali sweetness.', description: 'A sandesh selection for exploring the Bengali sweets collection.', price: 299, flavour: 'Classic Chhena', rank: 14 }),
  illustrativeSweet({ slug: 'soan-papdi', name: 'Soan Papdi', subcategory: 'traditional-sweets', sweetType: 'soan-papdi', photo: 'sweet-kaju-katli', alt: 'Representative photograph of traditional diamond-shaped mithai', note: 'Made for a traditional sweet box.', description: 'A soan papdi selection inspired by the familiar flaky Indian sweet.', price: 229, flavour: 'Classic', rank: 15 }),
  illustrativeSweet({ slug: 'mysore-pak', name: 'Mysore Pak', subcategory: 'traditional-sweets', sweetType: 'mysore-pak', photo: 'sweet-almond-barfi', alt: 'Representative photograph of traditional mithai pieces', note: 'A classic worth sharing.', description: 'A Mysore pak selection inspired by the traditional besan and ghee sweet.', price: 299, flavour: 'Besan & Ghee', rank: 16 }),
  illustrativeSweet({ slug: 'dates-seeds-bites', name: 'Dates & Seeds Bites', subcategory: 'healthy-sweets', sweetType: 'dates-seeds', photo: 'sweet-laddu', alt: 'Representative photograph of round sweets on a serving plate', note: 'Dates and seeds, thoughtfully paired.', description: 'A date and seed-inspired bite for the Healthy Bites collection. No nutritional benefit or sugar-content claim is implied.', price: 349, flavour: 'Dates & Seeds', rank: 17 }),
  illustrativeSweet({ slug: 'jaggery-nut-bites', name: 'Jaggery & Nut Bites', subcategory: 'healthy-sweets', sweetType: 'jaggery-nuts', photo: 'sweet-laddu', alt: 'Representative photograph of round laddu-style sweets', note: 'A nutty, jaggery-inspired bite.', description: 'A jaggery and nut-inspired option for a different kind of sweet gift. Jaggery is a sugar; this selection is not labelled sugar-free.', price: 329, flavour: 'Jaggery & Nuts', rank: 18 }),
  illustrativeSweet({ slug: 'sugar-free-kaju-bites', name: 'Sugar-Free Kaju Bites', subcategory: 'sugar-free-sweets', sweetType: 'kaju', photo: 'sweet-kaju-katli', alt: 'Representative photograph of kaju katli; not a verified sugar-free recipe', note: 'Sample recipe for the sugar-free range.', description: 'A placeholder for a sugar-free kaju recipe. The formulation, sweetener and nutrition must be verified before offering it; suitability for a particular diet is not established.', price: 449, flavour: 'Cashew', rank: 19 }),
  illustrativeSweet({ slug: 'sugar-free-pista-bites', name: 'Sugar-Free Pista Bites', subcategory: 'sugar-free-sweets', sweetType: 'pista', photo: 'sweet-almond-barfi', alt: 'Representative photograph of nut-topped mithai; not a verified sugar-free recipe', note: 'Sample recipe for the sugar-free range.', description: 'A placeholder for a sugar-free pista recipe. The formulation, sweetener and nutrition must be verified before offering it; suitability for a particular diet is not established.', price: 479, flavour: 'Pistachio', rank: 20 }),
  illustrativeSweet({ slug: 'moong-dal-halwa', name: 'Moong Dal Halwa', subcategory: 'halwa-desserts', sweetType: 'moong-dal', photo: 'sweet-almond-barfi', alt: 'Representative traditional sweets photograph for the dessert catalogue', note: 'A traditional dessert to share.', description: 'A moong dal halwa selection for the Indian desserts collection.', price: 299, flavour: 'Moong Dal', rank: 21 }),
  illustrativeSweet({ slug: 'gajar-halwa', name: 'Gajar Halwa', subcategory: 'halwa-desserts', sweetType: 'gajar', photo: 'sweet-rose-barfi', alt: 'Representative mithai photograph for the dessert catalogue', note: 'A familiar carrot-inspired dessert.', description: 'A gajar halwa selection inspired by the traditional carrot and milk dessert.', price: 279, flavour: 'Carrot', rank: 22 }),
  illustrativeSweet({ slug: 'jalebi', name: 'Jalebi', subcategory: 'jalebi-ghewar', sweetType: 'jalebi', photo: 'sweet-laddu', alt: 'Representative golden sweets photograph for the jalebi catalogue', note: 'A golden desi favourite.', description: 'A jalebi selection inspired by the familiar syrup-soaked spirals.', price: 199, flavour: 'Classic', rank: 23 }),
  illustrativeSweet({ slug: 'ghewar', name: 'Ghewar', subcategory: 'jalebi-ghewar', sweetType: 'ghewar', photo: 'sweet-almond-barfi', alt: 'Representative traditional sweets photograph for the ghewar catalogue', note: 'A festive sweet to discover.', description: 'A ghewar selection inspired by the traditional festive honeycomb-style sweet.', price: 349, flavour: 'Classic', rank: 24 }),
  illustrativeSweet({ slug: 'premium-mithai-box', name: 'Premium Mithai Box', subcategory: 'gift-boxes', sweetType: 'premium', photo: 'sweet-kaju-katli', alt: 'Representative kaju katli photograph for a premium mithai selection', note: 'A thoughtful premium selection.', description: 'A sample mithai assortment inspired by kaju, pista and anjeer sweets. The final assortment and packaging need confirmation.', price: 599, flavour: 'Assorted Premium Mithai', rank: 25 }),
  illustrativeSweet({ slug: 'desi-mithai-box', name: 'Desi Mithai Box', subcategory: 'gift-boxes', sweetType: 'desi', photo: 'sweet-laddu', alt: 'Representative laddu photograph for a traditional mithai selection', note: 'Tradition, ready to share.', description: 'A sample assortment of traditional Indian sweets. The final assortment and packaging need confirmation.', price: 449, flavour: 'Assorted Traditional Mithai', rank: 26 }),
  illustrativeSweet({ slug: 'besan-laddu', name: 'Besan Laddu', subcategory: 'laddu', sweetType: 'besan', photo: 'sweet-laddu', alt: 'Representative photograph of round laddus arranged together', note: 'A timeless laddu favourite.', description: 'A besan laddu selection inspired by the familiar roasted gram flour sweet.', price: 249, flavour: 'Besan', rank: 27 }),
  illustrativeSweet({ slug: 'jaggery-laddu', name: 'Jaggery Laddu', subcategory: 'laddu', sweetType: 'jaggery', photo: 'sweet-laddu', alt: 'Representative photograph of round laddu-style sweets', note: 'A jaggery-inspired take on laddu.', description: 'A jaggery-based laddu option for exploring the collection. Jaggery is a sugar; this product is not labelled sugar-free.', price: 299, flavour: 'Jaggery', rank: 28 }),
]

export const catalogProducts = [...cakeProducts, ...chocolateProducts, ...sweetProducts]

export const heroCollections = [
  { id: 'cakes', name: 'Cakes & Pastries', href: '/cakes', images: cakeProducts.slice(0, 5).map(({ image: src, alt }) => ({ src, alt })) },
  { id: 'chocolates', name: 'Chocolates', href: '/chocolates', images: chocolateProducts.slice(0, 5).map(({ image: src, alt }) => ({ src, alt })) },
  { id: 'sweets', name: 'Sweets', href: '/sweets', images: sweetProducts.slice(0, 5).map(({ image: src, alt }) => ({ src, alt })) },
]

export function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number.isFinite(amount) ? amount : 0)
}

export function getUnitPrice(product, weight) {
  return product?.weights?.find((option) => option.label === weight)?.price ?? product?.weights?.[0]?.price ?? product?.price
}
