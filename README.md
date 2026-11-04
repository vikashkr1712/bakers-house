# Baker’s House — Artisan Bakery

A responsive artisan bakery website with a black, warm cream, and muted gold theme. Built with React, Vite, React Router, Tailwind CSS, Motion, and Lucide.

## Run locally

Use Node.js 22.12 or later.

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

The production build is written to `dist/`. No environment variables or backend services are required.

## Pages and features

- Homepage with three manually selected photographic hero compositions, bakery categories, story, favorites, an illustrative testimonial, and a newsletter demo.
- A dedicated `/shop` page with category filters, live search, sorting, product previews, and a basket shared with the homepage.
- Shareable shop filters, for example `/shop?category=pastries` or `/shop?q=chocolate&sort=name-asc`.
- Responsive mobile navigation, keyboard-accessible dialogs, reduced-motion support, and readable type.
- Optimized local WebP photographs and self-hosted Playfair Display and Inter fonts.

## Vercel deployment

Import this repository into Vercel with the **Vite** framework preset. The build command is `npm run build` and the output directory is `dist`.

`vercel.json` includes the [Vercel-recommended SPA rewrite](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas), allowing direct visits and refreshes at `/shop` to work.

## Frontend demo behavior

The basket is stored locally in the browser under `bakers-house-basket-v1`. Newsletter demo input is stored under `bakers-house-newsletter-demo`; it is never emailed or sent to a server. The privacy dialog can clear saved demo data. No payment or real order is submitted.

Prices, contact details, verified testimonials, ordering, and mailing-service integrations should be supplied before a commercial launch. No business prices, ratings, discounts, contact details, or social media URLs have been invented. The sample testimonial is labeled on the website.

## Project structure

```text
src/
  components/   Reusable navigation, cards, dialogs, and footer
  data/         Products and categories
  hooks/        Persistent browser basket
  pages/        Dedicated shop page
  sections/     Homepage sections
  styles/       Shared theme and scoped shop styles
public/
  fonts/        WOFF2 fonts and original license notices
  images/bakery/ Optimized website photography
```

This repository contains application source, required assets, package manifests, deployment configuration, and this README. Local test code, test images, screenshots, reports, original photo downloads, and asset-download scripts are excluded.

## Photograph sources and licenses

All 13 photographs are genuine stock photography downloaded on **2026-11-04**, optimized to WebP, and served locally. No AI-generated food imagery is used. Paths below are relative to `public/images/bakery/`.

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
