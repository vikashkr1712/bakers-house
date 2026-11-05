const image = (name) => `/images/bakery/redesign/${name}.webp`

export const cakeCategories = [
  { id: 'birthday', name: 'Birthday Cake', heading: 'Birthday Cakes', image: image('cake-birthday'), alt: 'White buttercream cake decorated with colourful sprinkles' },
  { id: 'anniversary', name: 'Anniversary Cake', heading: 'Anniversary Cakes', image: image('cake-anniversary'), alt: 'White celebration cake decorated with white and blue flowers' },
  { id: 'kids', name: 'Kids Special', heading: 'Kids Special Cakes', image: image('cake-kids'), alt: 'Round white cake covered with colourful rainbow sprinkles' },
  { id: 'party', name: 'Party Cake', heading: 'Party Cakes', image: image('cake-party'), alt: 'Rustic tiered celebration cake decorated with pastries and flowers' },
  { id: 'baby-shower', name: 'Baby Shower Cake', heading: 'Baby Shower Cakes', image: image('cake-baby-shower'), alt: 'White baby shower cake surrounded by blue and yellow balloons' },
]

function cake({ slug, name, tags, photo, alt, note, description, price, flavours, rank, bestseller = false, available = true }) {
  return {
    id: `cake-${slug}`, slug, name, category: 'Cakes & Pastries', collection: 'cakes', tags,
    description, note, image: image(photo), images: [image(photo)], alt, price,
    weights: [{ label: '500 g', price }, { label: '1 kg', price: price * 2 - 99 }, { label: '1.5 kg', price: price * 3 - 148 }],
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

function confection({ slug, name, collection, photo, alt, note, description, price, flavour, rank, bestseller = false }) {
  return {
    id: `${collection}-${slug}`, slug, name, collection,
    category: collection === 'chocolates' ? 'Chocolates' : 'Sweets',
    tags: [collection === 'chocolates' ? 'Chocolate Collection' : 'Traditional Sweets'],
    image: image(photo), images: [image(photo)], alt, note, description, price,
    weights: [{ label: '250 g', price }, { label: '500 g', price: price * 2 - 49 }],
    flavours: [flavour], available: true, bestseller, bestsellerRank: rank,
    detailPath: `/products/${slug}`,
  }
}

export const chocolateProducts = [
  confection({ slug: 'signature-truffles', name: 'Signature Truffles', collection: 'chocolates', photo: 'chocolate-truffles', alt: 'A selection of rich chocolate truffles', note: 'Small bites of pure indulgence.', description: 'Smooth chocolate centres wrapped in a delicate cocoa finish. A thoughtful gift or a quietly indulgent moment of your own.', price: 549, flavour: 'Dark Chocolate', rank: 1, bestseller: true }),
  confection({ slug: 'nut-chocolate-bars', name: 'Nut Chocolate Bars', collection: 'chocolates', photo: 'chocolate-nut-bars', alt: 'Handmade chocolate bars topped with nuts and coconut flakes', note: 'A little crunch. A lot to love.', description: 'Rich chocolate bars finished with nuts and coconut flakes. Break, share and enjoy a little everyday sweetness.', price: 449, flavour: 'Nut & Coconut', rank: 2, bestseller: true }),
  confection({ slug: 'chocolate-pralines', name: 'Chocolate Pralines', collection: 'chocolates', photo: 'chocolate-pralines', alt: 'A collection of individually crafted chocolate pralines', note: 'A box of little discoveries.', description: 'Delicate chocolate shells with a soft centre, made for gifting and sharing. Each bite brings a little something special to the table.', price: 649, flavour: 'Hazelnut Chocolate', rank: 3 }),
  confection({ slug: 'dark-chocolate-bites', name: 'Dark Chocolate Bites', collection: 'chocolates', photo: 'chocolate-dark', alt: 'Rich dark chocolate pieces', note: 'Deep cocoa. A smooth finish.', description: 'Rich dark chocolate in easy-to-share pieces. Enjoy slowly with a warm cup of coffee or bring a little indulgence to a gift box.', price: 499, flavour: 'Dark Chocolate', rank: 4 }),
  confection({ slug: 'chocolate-gift-box', name: 'Chocolate Gift Box', collection: 'chocolates', photo: 'chocolate-gift-box', alt: 'Assorted gourmet chocolate pralines arranged in a gift box', note: 'A little of everything you love.', description: 'An inviting assortment of chocolates for celebrations, thoughtful gifts and shared sweet moments.', price: 699, flavour: 'Assorted Chocolate', rank: 5 }),
]

export const sweetProducts = [
  confection({ slug: 'kaju-katli', name: 'Kaju Katli', collection: 'sweets', photo: 'sweet-kaju-katli', alt: 'Diamond-shaped pieces of traditional kaju katli', note: 'A timeless celebration favourite.', description: 'Fine cashew sweetness with a delicate, melt-in-the-mouth finish. A classic addition to festivals, family visits and thoughtful gifts.', price: 349, flavour: 'Cashew', rank: 1, bestseller: true }),
  confection({ slug: 'gulab-jamun', name: 'Gulab Jamun', collection: 'sweets', photo: 'sweet-gulab-jamun', alt: 'Golden-brown gulab jamun in a sweet syrup', note: 'Comfort in every sweet spoonful.', description: 'Soft, golden dumplings in fragrant sugar syrup. Serve gently warmed for a familiar finish to a gathering around the table.', price: 249, flavour: 'Classic', rank: 2, bestseller: true }),
  confection({ slug: 'rasgulla', name: 'Rasgulla', collection: 'sweets', photo: 'sweet-rasgulla', alt: 'Soft white rasgulla in a light syrup', note: 'Soft, light and wonderfully sweet.', description: 'Delicate chhena dumplings soaked in a light sugar syrup. A refreshing, familiar sweet for festive tables and everyday treats.', price: 229, flavour: 'Classic', rank: 3 }),
  confection({ slug: 'motichoor-laddu', name: 'Motichoor Laddu', collection: 'sweets', photo: 'sweet-laddu', alt: 'Traditional golden-orange motichoor laddus', note: 'Little golden moments of joy.', description: 'Fine pearls of sweet boondi brought together in a soft, fragrant laddu. A much-loved companion to celebrations big and small.', price: 279, flavour: 'Classic', rank: 4 }),
  confection({ slug: 'almond-barfi', name: 'Almond Barfi', collection: 'sweets', photo: 'sweet-almond-barfi', alt: 'Traditional almond barfi decorated with nuts', note: 'A little taste of tradition.', description: 'A rich almond sweet with a soft, delicate bite and a nutty finish. Simple, comforting and made for the moments you want to share.', price: 349, flavour: 'Almond', rank: 5 }),
]

export const catalogProducts = [...cakeProducts, ...chocolateProducts, ...sweetProducts]

export const heroCollections = [
  { id: 'cakes', name: 'Cakes & Pastries', href: '/cakes', images: cakeProducts.slice(0, 5).map(({ image: src, alt }) => ({ src, alt })) },
  { id: 'chocolates', name: 'Chocolates', href: '/chocolates', images: chocolateProducts.map(({ image: src, alt }) => ({ src, alt })) },
  { id: 'sweets', name: 'Sweets', href: '/sweets', images: sweetProducts.map(({ image: src, alt }) => ({ src, alt })) },
]

export function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number.isFinite(amount) ? amount : 0)
}

export function getUnitPrice(product, weight) {
  return product?.weights?.find((option) => option.label === weight)?.price ?? product?.weights?.[0]?.price ?? product?.price
}
