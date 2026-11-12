# Baker’s House

A React/Vite bakery website with customizable cakes and hampers, offers, pickup/delivery scheduling and WhatsApp order requests. Checkout runs entirely in the browser: customers choose cash on delivery, pay at pickup or manual online payment via WhatsApp. No payment gateway, order API or order database is required.

For GitHub Actions deployment to S3 and HTTPS through CloudFront, follow [the AWS deployment guide](deploy/aws/README.md). The website uses refresh-safe hash URLs and includes the complete WhatsApp checkout. Pushes to `main` automatically build and upload the website, then refresh CloudFront; the manual Run workflow button remains available. AWS resources and the upload user's permissions are configured separately.

Changes stay local unless the user explicitly requests publication of the current changes. Previously deployed sites and the existing GitHub repository do not update automatically from this workspace.

## Run locally

Use Node.js 24.x, matching the package engine.

```sh
npm install
npm run dev
```

The development server uses port 5000. For a built static preview:

```sh
npm run build
npm run preview
```

The build output is `dist/`. Its contents belong directly at the bucket root: `index.html`, `assets/`, `fonts/` and `images/`. Routes use `/#/checkout` and similar hash URLs, so refreshing a route needs no server rewrite. GitHub Actions builds and uploads these files; ZIP archives and extracted deployment copies are not required.

The hosted storefront needs no server/payment source or environment variables. Do not upload `.env` files, database files or source archives to S3.

## Collections and purchasing

- `/` has Cakes & Pastries, Chocolates and Sweets hero selections, each with five distinct real photos. Staggered corner entrances replay on selection; gentle floating stops when reduced motion is enabled.
- `/cakes` has a dedicated hero and Birthday Cake, Anniversary Cake, Kids Special, Party Cake and Baby Shower Cake filters. The default mixes all occasions in curated bestseller order. Filters persist in the URL.
- `/shop` shows the current catalogue across Cakes & Pastries, Chocolates and Sweets. Category, collection, subcategory, starting-price, best-seller and cake-occasion filters combine with text search. Chocolates include Milk, Dark, Dry Fruit & Nuts, Kids Special and Assorted selections. Sweets begin with Premium Mithai Collection (kaju, pista, anjeer and gifting sweets), Healthy Bites Collection (nuts, dates, seeds and jaggery-based sweets), or Desi Mithai Collection (traditional Indian sweets). Selecting a collection opens its categories below; selecting a category such as Laddu reveals its types and matching products. Parent changes clear dependent filters, and “All sweets” restores the complete sweet catalogue. Sort by best sellers, price or name. Filters and sort are saved in the URL and restored when returning from product details.
- `/cakes/:slug` and `/products/:slug` provide product details, supported weights/flavours, quantity, calculated prices, Add to cart and Buy now. Cake details also collect eggless/with-egg preferences and an optional cake message of up to 80 characters, subject to bakery confirmation.
- `/chocolates` and `/sweets` provide matching collection pages, the same nested filters, and working product details. Sweet categories across the three collections include Laddu, Barfi, Peda, Jamun, Bengali Sweets, Traditional Sweets, Dry Fruit Sweets, Healthy Sweets, Sugar-Free Sweets, Halwa & Desserts, Jalebi & Ghewar, and Gift Boxes. Categories can belong to more than one collection; their type choices follow the selected collection.
- `/gift-hampers` offers three ready-made combinations and a custom hamper builder. Only available chocolates and sweets can be added; cakes are excluded. The builder uses the same three sweet collections, categories and types. Choose pack sizes, up to eight packs, gift packaging, a hamper name and an optional gift message. Ready-made hampers can also be customized. Each gift remains one grouped basket line with its contents, packaging, message and calculated price, and can be edited from the basket.
- `/search` matches names, categories, occasion tags, notes, descriptions and flavours. Queries and categories survive refreshes and return navigation.
- `/cart` supports separate variant lines, quantities, subtotals and checkout. Cake weight, flavour, egg preference and message can be edited directly in the cart; matching variants merge. Existing saved legacy product IDs still work, with unpriced items marked “Price on request”.
- `/checkout` validates customer contact details, pickup/delivery, serviceable pincode, date and time slot. Customers choose manual online payment via WhatsApp, Cash on Delivery or Pay at pickup. Both payment choices prepare the full order message locally and open the bakery’s WhatsApp chat; the customer taps Send. Online payment instructions ask the customer to obtain payment details, pay separately and attach a screenshot in chat. Payment stays unverified until the bakery checks receipt. Buy now includes only its requested quantity; the rest of the basket remains saved.

Category browsers use visible buttons for chocolate types, sweet categories and sweet varieties. Sweet collections are collapsible accordions: clicking the open collection again, using Close, or pressing Escape hides its choices while keeping the selected filters. A compact summary shows the current selection. On phones and inside the hamper builder, each panel opens directly below its collection header. “Show N sweets” closes the panel and moves to the matching products; “All sweets” clears the sweet filters.

Shop cake occasions now use the same visible-button pattern. The navbar's Shop button opens grouped cake, chocolate and sweet category links on desktop and inside mobile navigation; Shop all products opens the complete catalogue. The menu closes after choosing a destination, clicking outside, or pressing Escape.

All 45 current products have seven-picture galleries: the existing main product photograph plus six shared, clearly labelled generated inspiration samples for that product's collection. The additional images show serving, craft, gifting, celebrations, ingredients and texture inspiration; they do not claim to show six extra angles or verified recipes of the actual product. The built-in image generation tool created 18 collection samples. Optimized WebP files and the complete prompts are in `public/images/bakery/gallery/`; original PNGs are preserved in `.asset-originals/gallery/`. See `gallery-sample-prompts.json` and `optimization.json` in the gallery directory.

Shop cards automatically cycle their seven photographs every four seconds while on screen and provide manual previous/next arrows. The card counter appears on mouse hover or keyboard focus; it stays hidden on idle cards and touch screens. Choosing an arrow or focusing a card pauses playback until focus leaves the card. Offscreen cards and hidden tabs do not advance, and reduced motion disables autoplay. Product details always show the counter, seven thumbnails and previous/next controls. Weight options now extend to 5 kg for cakes, chocolates and sweets, preserving existing pack sizes and prices; larger sample prices scale from existing pack rates.

Gift Hamper body text is larger, with a wider desktop summary and earlier column stacking rather than shrinking labels. Native dropdowns use a thin neutral focus outline instead of the thick burgundy ring.

Prices, weights and flavours are example catalogue values selected as requested. Bestseller order is editorial, rather than a claim backed by actual sales. No ratings, customer testimonials or sales totals have been invented. Replace the catalogue values and confirm ingredients/availability before commercial use.

Hamper packaging prices are also illustrative: Classic gift box ₹99, Keepsake gift box ₹199 and Gift basket ₹249. Hamper totals use the selected product packs plus packaging, with no separate gift-message charge. Product imagery represents the contents rather than a photograph of an assembled hamper. New mithai variants reuse representative local photographs; check each image description rather than treating it as a photograph of that exact recipe. “Healthy Bites”, “Protein” and “Sugar-Free” are sample catalogue labels, not verified nutritional or medical claims. Confirm recipes, ingredients, allergens and any nutritional labelling before commercial use.

Sweet filter links use `mithai=premium|healthy|desi`, followed by `subcategory` and `type` when selected. For example, `/sweets?mithai=desi&subcategory=laddu&type=motichoor` opens the Desi collection’s Motichoor laddus. Existing subcategory-only links remain supported and infer the appropriate collection.

Contact submissions remain local demos with no email integration. Checkout uses the browser-only WhatsApp handoff described below. The informational Contact page still uses `src/config/contact.js`; provenance is in [contact-sources.md](contact-sources.md).

## WhatsApp checkout and manual payment

The site prepares a normal `wa.me` click-to-chat link. Meta API access tokens, approved templates, WhatsApp webhooks, Razorpay credentials and a database are not required. The customer must tap **Send** in WhatsApp. Opening the chat does not prove that the message was sent or the order was accepted.

Cash delivery messages say **Cash on delivery**; cash pickup messages say **Pay at pickup**. Manual online-payment messages ask the bakery to share payment details and instruct the customer to make the payment and send the screenshot in that chat. The website neither takes payment nor marks it paid. Staff must check the actual receipt of money before confirming payment; a screenshot or editable message alone is not proof.

The order message includes products and quantities, cake weight/flavour/egg preference/message, hamper contents, customer contact, delivery address or pickup store, requested date/slot, instructions, offer saving, delivery fee, estimated total and payment choice. **Open WhatsApp** and **Copy order message** provide a fallback. Refreshing checkout does not automatically reopen WhatsApp. No permanent order history or backend record is created.

The bakery recipient is the public `whatsappNumber` in `src/config/ordering.js`, currently **+91 79821 07035**. It is distinct from the customer number entered at checkout. Staff reply in their normal WhatsApp or WhatsApp Business app to confirm availability, final pricing and acceptance.

Store rules are public settings in the same config: 24 Bakery Lane, Kalyanpur, Kanpur 208001; pincodes 208001/208002/208003; delivery fee ₹49; daily 10 am–7 pm; 24-hour preparation; maximum 30 days ahead. Confirm these sample business settings before real use. Offers in `src/utils/checkoutPricing.js` remain SWEET10 (10% on ₹500+, cap ₹200), TREAT150 (₹150 on ₹1,500+) and FREEDEL (delivery fee waived on ₹750+, delivery only). Browser-calculated prices are estimates for bakery confirmation, not tamper-proof billing.

## About, Our Story and Contact

The `/about`, `/our-story` and `/contact` pages are enabled in the header, mobile navigation and footer. The legacy `/#contact` link opens Contact. About includes philosophy and craft sections, Our Story has reading chapters, and Contact has business details and a validated demo form. The three page flags in `src/config/site.js` are `true`.

## Storage and privacy

The basket uses the existing `bakers-house-basket-v1` local-storage key and migrates old basket entries. Identical product/weight/flavour selections merge; different selections stay separate. Quantity is limited to 1–99. Hamper configurations, including gift messages, are saved with their grouped basket lines; identical gifts merge, while different contents, packaging, names or messages remain separate. Saved hampers are revalidated against the current catalogue and their prices are recalculated, so malformed entries cannot introduce cakes or override prices.

The custom hamper draft uses `bakers-house-hamper-draft-v1` on the visitor’s device. Cake messages and hamper notes remain saved with the basket. Checkout input drafts use session storage under `bakers-house-whatsapp-checkout-v1`. No server order record or verified payment status is stored. The basket remains saved until the customer clears it.

The footer can save an email on this device using `bakers-house-newsletter-demo` and clearly reports that no emails are sent. Privacy **Clear saved data** removes the browser basket, hamper draft, saved email, checkout draft and legacy order/payment session keys. It cannot remove WhatsApp messages, attachments or payments shared outside the site. Browser storage is optional; blocking it can prevent draft persistence but does not require a server.

The full order summary is included in the WhatsApp click-to-chat URL when the customer continues. This shares the supplied details with WhatsApp, and the customer controls sending the message to the bakery. The site does not automatically send messages, read conversations or verify screenshots. No analytics or tracking cookies are added by this website.

## Images and accessibility

Photographs are downloaded locally, rather than hotlinked. The redesign adds 21 distinct optimized WebP photos. Google Images was attempted but blocked by its traffic challenge; original Pexels sources and their free commercial-use license were verified. These are licensed photographs, rather than a claim that copyright does not exist.

Sources: [new photographs](image-sources-redesign.md), [retained photographs](image-sources.md), [fonts](font-sources.md). The original Inter and Playfair Display font families are retained.

The site supports responsive layouts, native privacy dialogs, keyboard focus, skip navigation, concise filter names, 44px purchase controls, and reduced-motion preferences.
