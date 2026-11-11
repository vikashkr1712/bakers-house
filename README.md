# Baker’s House

Bakery storefront with delivery/pickup checkout, cash orders, Razorpay Test Mode and a customer-sent WhatsApp order summary.

## Run locally

Use Node.js 24.x. Install with npm ci, then npm run dev. To serve a production build locally, run npm run build followed by npm start.

Checkout offers Pay online, Cash on delivery for delivery, and Pay at pickup for collection. Cash requests save before WhatsApp opens. Online requests open WhatsApp only after the server verifies the full captured test payment. The customer taps Send, and bakery staff confirm or decline availability in chat. Test Mode collects no real money.

## Vercel backend

The api catch-all function serves /api/orders and protected order reads. Neon Postgres provides persistent serverless storage; local development uses SQLite when no cloud database is configured. Vercel requires a persistent database and will not silently store orders in temporary SQLite files.

Set DATABASE_URL (or DATABASE_URL_UNPOOLED), RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the Vercel environment. Only rzp_test_ keys are accepted. ORDER_PUBLIC_BASE_URL is the trusted HTTPS checkout origin. Optional settings: RAZORPAY_WEBHOOK_SECRET, BAKERY_WHATSAPP_NUMBER and BAKERY_STAFF_TOKEN. See .env.example for names; keep all actual values server-side.

The default WhatsApp recipient is +91 79821 07035. Click-to-chat requires no WhatsApp API credentials. Order and payment status remain separate: a saved or paid request still awaits bakery confirmation. Customer messages can be edited; staff should check the saved order/payment reference before accepting.

Public catalogue prices, pickup address and serviceable delivery PIN codes are sample settings. Confirm them before real commercial use. This repository includes app source, required assets, deployment configuration and licenses. Browser artifacts, customer data and secret files are excluded.

## Photograph sources and licenses

The original 13 photographs are genuine stock photography downloaded on **2026-11-04**, optimized to WebP, and served locally. Generated gallery inspiration images are documented separately below. Paths below are relative to `public/images/bakery/`.

- [Unsplash License](https://unsplash.com/license): permits commercial website use and modification.
- [Pexels License](https://www.pexels.com/license/): permits commercial website use and modification.
- [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/): the chocolate cake slice also has an independently reviewed CC0 record on Wikimedia Commons.

The photographs illustrate the collection. The pictured baker is a stock-photo subject, not an identified Baker’s House employee or endorser.

| Local file | Original source page | Photographer | License | Original resolution |
| --- | --- | --- | --- | --- |
| `hero/hero-artisan-bread.webp` | [Dark rustic loaf](https://unsplash.com/photos/close-up-photo-of-brown-cookie-j1gr2w10EtQ) | Jonathan Pielmayer | [Unsplash](https://unsplash.com/license) | 6000 × 4000 |
| `hero/hero-fresh-croissant.webp` | [Two golden croissants on dark background](https://www.pexels.com/photo/croissant-3850349/) | ready made | [Pexels](https://www.pexels.com/license/) | 6000 × 4000 |
| `hero/hero-chocolate-cake.webp` | [Rich chocolate cake with textured frosting](https://www.pexels.com/photo/rich-chocolate-cake-with-textured-frosting-29538420/) | Nano Erdozain | [Pexels](https://www.pexels.com/license/) | 3524 × 4406 |
| `categories/category-breads.webp` | [Sliced breads](https://unsplash.com/photos/sliced-breads-GzBO_o0RvEg) | Rodolfo Marques | [Unsplash](https://unsplash.com/license) | 4113 × 5141 |
| `categories/category-pastries.webp` | [Photo of a croissant on a plate](https://www.pexels.com/photo/photo-of-a-croissant-on-a-plate-16543194/) | Lisa Fotios | [Pexels](https://www.pexels.com/license/) | 2990 × 3748 |
| `categories/category-cakes.webp` | [Close-up shot of cupcakes with berries](https://www.pexels.com/photo/close-up-shot-of-cupcakes-with-berries-7966067/) | Felicity Tai | [Pexels](https://www.pexels.com/license/) | 6000 × 4000 |
| `categories/category-cookies.webp` | [Stack of chocolate chip cookies](https://www.pexels.com/photo/stack-of-chocolate-chip-cookies-20473669/) | Seats Photographix / @spstudio10 | [Pexels](https://www.pexels.com/license/) | 5628 × 3744 |
| `products/product-sourdough-bread.webp` | [Freshly baked sourdough bread on a black surface](https://www.pexels.com/photo/freshly-baked-sourdough-bread-on-a-black-surface-4881596/) | Jytte Elfferich | [Pexels](https://www.pexels.com/license/) | 3456 × 5184 |
| `products/product-almond-croissant.webp` | [A pan filled with bread covered in almonds](https://unsplash.com/photos/a-pan-filled-with-bread-covered-in-almonds-nRqpigMY1kU) | Lily Bui Thi | [Unsplash](https://unsplash.com/license) | 2240 × 3984 |
| `products/product-chocolate-cake.webp` | [Chocolate cake with a blueberry topping — original Pexels source](https://www.pexels.com/photo/blueberries-cake-chocolate-chocolate-cake-291528/), [independent source and CC0 review](https://commons.wikimedia.org/wiki/File:Sliced_chocolate_cake.jpg) | Abhinav Goswami | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) / [Pexels](https://www.pexels.com/license/) | 2564 × 2160 |
| `products/product-cinnamon-roll.webp` | [Close-up of cinnamon rolls covered in icing](https://www.pexels.com/photo/close-up-of-cinnamon-rolls-covered-in-icing-5507697/) | Jess Loiterton | [Pexels](https://www.pexels.com/license/) | 9000 × 6000 |
| `story/story-baker-working.webp` | [Man preparing dough for bread](https://www.pexels.com/photo/man-preparing-dough-for-bread-3218467/) | Vaibhav Jadhav | [Pexels](https://www.pexels.com/license/) | 5184 × 3456 |
| `banners/banner-fresh-pastries.webp` | [Fresh croissant on wooden board on table](https://www.pexels.com/photo/fresh-croissant-on-wooden-board-on-table-16026792/) | Marcelo Verfe | [Pexels](https://www.pexels.com/license/) | 4152 × 2843 |

The original hero loaf’s Unsplash URL has an inaccurate `brown-cookie` slug; the photograph itself shows artisan bread. Its original photo ID is `j1gr2w10EtQ`.

## Font sources and licenses

Downloaded from the official Google Fonts CDN on **2026-11-04** and served locally.

| Local file | Family | Style | Variable weight range | Original binary |
| --- | --- | --- | --- | --- |
| `public/fonts/inter-latin-variable.woff2` | Inter | Normal | 100–900 | [Google Fonts WOFF2](https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2) |
| `public/fonts/playfair-display-latin-variable.woff2` | Playfair Display | Normal | 400–900 | [Google Fonts WOFF2](https://fonts.gstatic.com/s/playfairdisplay/v40/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgA.woff2) |
| `public/fonts/playfair-display-latin-italic-variable.woff2` | Playfair Display | Italic | 400–900 | [Google Fonts WOFF2](https://fonts.gstatic.com/s/playfairdisplay/v40/nuFkD-vYSZviVYUb_rj3ij__anPXDTnogkk7.woff2) |

Both families use the **SIL Open Font License 1.1**. Full license notices are retained at `public/fonts/Inter-OFL.txt` and `public/fonts/PlayfairDisplay-OFL.txt`.

- Inter: [official font source](https://github.com/google/fonts/tree/main/ofl/inter), [official license](https://github.com/google/fonts/blob/main/ofl/inter/OFL.txt).
- Playfair Display: [official font source](https://github.com/google/fonts/tree/main/ofl/playfairdisplay), [official license](https://github.com/google/fonts/blob/main/ofl/playfairdisplay/OFL.txt).


## Additional collection photographs

The redesign adds 21 real Pexels photographs, downloaded on 5 November 2026 and optimized locally. Google Images discovery was attempted but its traffic challenge prevented access; original Pexels sources and the [Pexels License](https://www.pexels.com/license/) were verified instead. These freely licensed photographs may be used on commercial websites; attribution is optional. These collection photographs are licensed stock images; the generated gallery samples are documented separately below. Do not resell unchanged copies or imply photographer endorsement.

Paths below are relative to `public/images/bakery/redesign/`. The local manifest also records source and license URLs.

| Local file | Photographer | Original Pexels page/listing | Download source |
| --- | --- | --- | --- |
| `cake-birthday.webp` | DRAKE NICOLLS | [10891153](https://www.pexels.com/photo/sprinkles-on-top-of-a-white-cake-10891153/) | [Original photograph](https://images.pexels.com/photos/10891153/pexels-photo-10891153.jpeg) |
| `cake-anniversary.webp` | Eneida Nieves | [934727](https://www.pexels.com/photo/white-flowers-on-round-cake-with-white-cream-934727/) | [Original photograph](https://images.pexels.com/photos/934727/pexels-photo-934727.jpeg) |
| `cake-kids.webp` | Natalia Sevruk | [36982680](https://www.pexels.com/photo/colorful-sprinkle-cake-with-icing-on-a-table-36982680/) | [Original photograph](https://images.pexels.com/photos/36982680/pexels-photo-36982680.jpeg) |
| `cake-party.webp` | Schuyler Love | [18421881](https://www.pexels.com/photo/birthday-cake-on-table-18421881/) | [Original photograph](https://images.pexels.com/photos/18421881/pexels-photo-18421881.jpeg) |
| `cake-baby-shower.webp` | Jonathan Borba | [33158033](https://www.pexels.com/photo/baby-shower-cake-with-blue-and-yellow-balloons-33158033/) | [Original photograph](https://images.pexels.com/photos/33158033/pexels-photo-33158033.jpeg) |
| `cake-strawberry.webp` | Wil Carranza | [18604370](https://www.pexels.com/photo/strawberry-on-top-of-pink-cake-18604370/) | [Original photograph](https://images.pexels.com/photos/18604370/pexels-photo-18604370.jpeg) |
| `cake-floral.webp` | Fernanda Leticia | [32978298](https://www.pexels.com/photo/elegant-wedding-cake-with-floral-decor-32978298/) | [Original photograph](https://images.pexels.com/photos/32978298/pexels-photo-32978298.jpeg) |
| `cake-chocolate.webp` | Nano Erdozain | [29538420](https://www.pexels.com/photo/rich-chocolate-cake-with-textured-frosting-29538420/) | [Original photograph](https://images.pexels.com/photos/29538420/pexels-photo-29538420.jpeg) |
| `cake-cream.webp` | Hanna Pad | [7552323](https://www.pexels.com/photo/white-cake-on-white-ceramic-plate-7552323/) | [Original photograph](https://images.pexels.com/photos/7552323/pexels-photo-7552323.jpeg) |
| `cake-red-velvet.webp` | Jonathan Valdes | [30665204](https://www.pexels.com/photo/celebratory-red-velvet-cake-with-30th-anniversary-decorations-30665204/) | [Original photograph](https://images.pexels.com/photos/30665204/pexels-photo-30665204.jpeg) |
| `chocolate-pralines.webp` | shuruq | [15833455](https://www.pexels.com/photo/close-up-photo-of-pralines-15833455/) | [Original photograph](https://images.pexels.com/photos/15833455/pexels-photo-15833455.jpeg) |
| `chocolate-gift-box.webp` | Egor Komarov | [13278153](https://www.pexels.com/photo/a-box-of-chocolate-pralines-13278153/) | [Original photograph](https://images.pexels.com/photos/13278153/pexels-photo-13278153.jpeg) |
| `chocolate-truffles.webp` | Abdullah Alsaibaie | [19121798](https://www.pexels.com/photo/a-box-of-chocolate-pralines-19121798/) | [Original photograph](https://images.pexels.com/photos/19121798/pexels-photo-19121798.jpeg) |
| `chocolate-dark.webp` | Eva Bronzini | [6261692](https://www.pexels.com/photo/chocolate-bar-on-a-brown-surface-6261692/) | [Original photograph](https://images.pexels.com/photos/6261692/pexels-photo-6261692.jpeg) |
| `chocolate-nut-bars.webp` | Polina Tankilevitch | [3735187](https://www.pexels.com/photo/chocolate-bar-3735187/) | [Original photograph](https://images.pexels.com/photos/3735187/pexels-photo-3735187.jpeg) |
| `sweet-kaju-katli.webp` | Gaurav Kumar | [18488310](https://www.pexels.com/photo/kaju-katri-18488310/) | [Original photograph](https://images.pexels.com/photos/18488310/pexels-photo-18488310.jpeg) |
| `sweet-gulab-jamun.webp` | Nishess Shakya | [15014919](https://www.pexels.com/photo/bowl-of-gulab-jamun-15014919/) | [Original photograph](https://images.pexels.com/photos/15014919/pexels-photo-15014919.jpeg) |
| `sweet-rasgulla.webp` | Divya Jain | [8788869](https://www.pexels.com/photo/round-foods-in-a-bowl-8788869/) | [Original photograph](https://images.pexels.com/photos/8788869/pexels-photo-8788869.jpeg) |
| `sweet-almond-barfi.webp` | Gaurav Kumar | [18488299](https://www.pexels.com/photo/almond-barfi-18488299/) | [Original photograph](https://images.pexels.com/photos/18488299/pexels-photo-18488299.jpeg) |
| `sweet-rose-barfi.webp` | Gaurav Kumar | [18488320](https://www.pexels.com/photo/rose-barfi-18488320/) | [Original photograph](https://images.pexels.com/photos/18488320/pexels-photo-18488320.jpeg) |
| `sweet-laddu.webp` | Divya Jain | [8659010](https://www.pexels.com/search/laddu/) | [Original photograph](https://images.pexels.com/photos/8659010/pexels-photo-8659010.jpeg) |
