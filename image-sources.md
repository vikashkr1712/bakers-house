# Bakery photography sources

All 13 photographs are real stock photographs downloaded to this project on **2026-11-04**. None were AI generated. Reference screenshots are design references only and are not used as website images. The website loads the optimized WebP files from `public/images/bakery/`; it does not hotlink stock servers.

## Discovery and license checks

Google Images was searched for `site:pexels.com bakery artisan bread croissant dark` using the original Google Images endpoint (`https://www.google.com/search?tbm=isch&q=site%3Apexels.com%20bakery%20artisan%20bread%20croissant%20dark`). The discovery HTML is retained locally in `.asset-originals/google-image-discovery.html`. Google thumbnails were not downloaded or used. Further targeted searches identified the original source pages below, whose photographer and license information were inspected. Original photographs were downloaded from the stock providers' image hosts at their full native resolutions, then resized and encoded to WebP with Pillow. No generated fill, artificial image extension, compositing, or replacement was performed.

- **[Unsplash License](https://unsplash.com/license)**: free commercial and noncommercial use, modification and distribution; permission and attribution are not required. Selling unmodified copies and compiling a competing stock service are excluded. Each selected Unsplash source is a free image under this license, not Unsplash+.
- **[Pexels License](https://www.pexels.com/license/)**: free use and modification; commercial websites, ecommerce shops, banners and marketing uses are expressly permitted. Attribution is not required. Do not imply that the photographers or depicted people endorse this bakery, resell unaltered photos, redistribute them as stock, or use them as a trademark.
- **[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)**: the chocolate cake slice is also independently documented as CC0 on Wikimedia Commons, including a 2017 source-license review. The original Pexels page was unavailable during retrieval, so its license and authorship were cross-checked against that archival record.

These are illustrative licensed stock photographs. The baker photograph does not identify an actual Baker's House employee or imply an endorsement.

## Asset register

Paths below are relative to `public/images/bakery/`. Every row was downloaded on **2026-11-04**.

| Local file | Original source page | Photographer | License | Original resolution |
| --- | --- | --- | --- | --- |
| `hero/hero-artisan-bread.webp` | [Dark rustic loaf](https://unsplash.com/photos/close-up-photo-of-brown-cookie-j1gr2w10EtQ) | Jonathan Pielmayer | [Unsplash](https://unsplash.com/license) | 6000 × 4000 |
| `hero/hero-fresh-croissant.webp` | [Two golden croissants on dark background](https://www.pexels.com/photo/croissant-3850349/) | ready made | [Pexels](https://www.pexels.com/license/) | 6000 × 4000 |
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

The hero loaf's Unsplash URL has an inaccurate autogenerated `brown-cookie` slug; visual inspection confirms a whole artisan loaf, not a cookie. It is the original photograph identified by photo ID `j1gr2w10EtQ`.

## Reproduction and originals

Original image downloads and visual contact sheets are retained locally in `.asset-originals/` and excluded from the build. The unused chocolate-cake hero was removed; its original `29538420.jpg` remains archived ([source](https://www.pexels.com/photo/rich-chocolate-cake-with-textured-frosting-29538420/), Nano Erdozain, [Pexels License](https://www.pexels.com/license/)). The optimized assets are all that the website needs to run. Use `python scripts/download-images.py` followed by `python scripts/optimize-bakery-images.py` to reproduce the selected downloads and optimization (Python and Pillow required). No images are upscaled or distorted; original aspect ratios are retained. Hero assets are up to 2600 pixels on their longest edge, other images use appropriate smaller output sizes.

Direct full-resolution Unsplash source downloads:

- Jonathan Pielmayer: `https://images.unsplash.com/photo-1511629036492-6c07153d3e83`
- Rodolfo Marques: `https://images.unsplash.com/photo-1533782654613-826a072dd6f3`
- Lily Bui Thi: `https://images.unsplash.com/photo-1727828659447-9ba18b9f9cdc`

The selected Pexels photographs use the stock provider's original download host at `https://images.pexels.com/photos/<photo-id>/pexels-photo-<photo-id>.jpeg`.
