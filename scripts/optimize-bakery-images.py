"""Optimize downloaded original photographs without generating or compositing imagery.

Requirements: Python 3, Pillow. Originals are downloaded by download-images.py.
Output retains the photographic aspect ratio and never upscales.
"""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ORIGINALS = ROOT / '.asset-originals'
ASSETS = [
    ('rustic-loaf', 'hero/hero-artisan-bread.webp', 2600),
    ('3850349', 'hero/hero-fresh-croissant.webp', 2400),
    ('sliced-breads', 'categories/category-breads.webp', 1400),
    ('16543194', 'categories/category-pastries.webp', 1400),
    ('7966067', 'categories/category-cakes.webp', 1400),
    ('20473669', 'categories/category-cookies.webp', 1400),
    ('4881596', 'products/product-sourdough-bread.webp', 1600),
    ('almond-croissants', 'products/product-almond-croissant.webp', 1600),
    ('291528', 'products/product-chocolate-cake.webp', 1600),
    ('5507697', 'products/product-cinnamon-roll.webp', 1600),
    ('3218467', 'story/story-baker-working.webp', 2000),
    ('16026792', 'banners/banner-fresh-pastries.webp', 2400),
]

for source, destination, limit in ASSETS:
    target = ROOT / 'public/images/bakery' / destination
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(ORIGINALS / f'{source}.jpg') as original:
        photo = ImageOps.exif_transpose(original).convert('RGB')
        photo.thumbnail((limit, limit), Image.Resampling.LANCZOS)
        photo.save(target, 'WEBP', quality=88, method=6)
        print(f'{destination}: {photo.width} x {photo.height}, {target.stat().st_size:,} bytes')

gallery = ROOT / 'public/images/bakery/gallery'
gallery.mkdir(parents=True, exist_ok=True)

sheet = Image.new('RGB', (1200, ((len(ASSETS)+2)//3)*320), '#efe9df')
draw = ImageDraw.Draw(sheet)
for index, (_, destination, _) in enumerate(ASSETS):
    with Image.open(ROOT / 'public/images/bakery' / destination) as photo:
        preview = ImageOps.contain(photo, (390,280))
        x, y = (index%3)*400, (index//3)*320
        sheet.paste(preview, (x+(400-preview.width)//2,y))
        draw.text((x+8,y+287), destination, fill='#111111')
sheet.save(ORIGINALS / 'selected-contact-sheet.jpg')
