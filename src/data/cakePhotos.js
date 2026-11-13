// Customer-supplied cake photographs. Names describe the visible design, not the filling.
const photo = (file, label, alt, width = 1536, height = 1024) => ({
  src: `/images/bakery/customer-cakes/${file}.webp`, label, alt, width, height,
})

export const cakePhotos = {
  pinkRosette: photo('pink-rosette', 'Pink rosette design', 'White cream cake with a sweep of pink buttercream roses and pink pearls'),
  pinkHeart: photo('pink-heart', 'Pink heart design', 'White cream cake with a pink piped heart, silver pearls and a pink petal border'),
  greenFloral: photo('green-floral', 'Green floral design', 'Sage green cake decorated with white flowers and delicate white pearls'),
  blueHearts: photo('blue-hearts', 'Blue hearts design', 'Blue ombré and white cream cake decorated with little red hearts'),
  sunnySmile: photo('sunny-smile', 'Sunshine smile design', 'Yellow smiley-face cake framed by white cream petals and yellow piping'),
  littleLion: photo('little-lion', 'Little lion design', 'Cream cake with a smiling lion face and a bright orange buttercream mane'),
  daisySmile: photo('daisy-smile', 'Smiling daisy design', 'White daisy cake with a smiling yellow centre, little flowers and green piping'),
  vanillaSmile: photo('vanilla-smile', 'Ivory smile design', 'Smooth ivory cream cake with chocolate eyes, a curved smile and red heart cheeks'),
  redRosette: photo('red-rosette', 'Red rosette design', 'White cream cake with a crescent of red buttercream rosettes and gold pearls', 1254, 1254),
}
