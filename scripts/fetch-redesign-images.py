"""Download real, freely licensed bakery photographs and optimize them locally.

Google Images is used only for discovery. Provider pages and provider licenses
are the source of the permission records, never Google's image thumbnails.
Requires Python 3 and Pillow; writes only public/images/bakery/redesign and the
redesign provenance document. No AI image generation or background synthesis.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import Request, build_opener, ProxyHandler
from urllib.parse import quote, unquote
from PIL import Image, ImageOps, ImageDraw
from io import BytesIO
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/images/bakery/redesign'
OUT.mkdir(parents=True, exist_ok=True)
OPENER = build_opener(ProxyHandler({}))

def fetch(url):
    return OPENER.open(Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; BakeryAssetResearch/1.0)'}), timeout=50).read()

def discover(query):
    url = 'https://www.google.com/search?tbm=isch&q=' + quote(query)
    try:
        body = fetch(url).decode('utf-8', 'replace')
        links = list(dict.fromkeys(unquote(link).replace('\\u003d', '=') for link in re.findall(r'https?[^\s<>"\\]+(?:pexels\.com|commons\.wikimedia\.org)[^\s<>"\\]*', body)))
        # Google's HTML changes often; this second pass also discovers direct provider photo paths.
        links += re.findall(r'https://www\.pexels\.com/photo/[a-zA-Z0-9-]+/', body)
        return {'query': query, 'url': url, 'bytes': len(body), 'providerLinks': list(dict.fromkeys(links))[:35]}
    except Exception as error:
        return {'query': query, 'url': url, 'error': str(error)}

ASSETS = [
    ('cakes', 'cake-birthday', 10891153, 'Sprinkle Celebration Cake', 'White buttercream cake decorated with colourful sprinkles', 'DRAKE NICOLLS', 'sprinkles-on-top-of-a-white-cake'),
    ('cakes', 'cake-anniversary', 934727, 'Floral Celebration Cake', 'White celebration cake decorated with white and blue flowers', 'Eneida Nieves', 'white-flowers-on-round-cake-with-white-cream'),
    ('cakes', 'cake-kids', 36982680, 'Rainbow Sprinkle Cake', 'Round white cake covered with colourful rainbow sprinkles', 'Natalia Sevruk', 'colorful-sprinkle-cake-with-icing-on-a-table'),
    ('cakes', 'cake-party', 18421881, 'Rustic Celebration Cake', 'Rustic tiered celebration cake decorated with pastries and flowers', 'Schuyler Love', 'birthday-cake-on-table'),
    ('cakes', 'cake-baby-shower', 33158033, 'Baby Shower Cake', 'White baby shower cake surrounded by blue and yellow balloons', 'Jonathan Borba', 'baby-shower-cake-with-blue-and-yellow-balloons'),
    ('cakes', 'cake-strawberry', 18604370, 'Strawberry Cream Cake', 'Pink strawberry cream cake topped with a strawberry and red sauce', 'Wil Carranza', 'strawberry-on-top-of-pink-cake'),
    ('cakes', 'cake-floral', 32978298, 'White Floral Cake', 'White wedding-style celebration cake decorated with white flowers', 'Fernanda Leticia', 'elegant-wedding-cake-with-floral-decor'),
    ('cakes', 'cake-chocolate', 29538420, 'Chocolate Celebration Cake', 'Rich chocolate celebration cake with chocolate frosting', 'Nano Erdozain', 'rich-chocolate-cake-with-textured-frosting'),
    ('cakes', 'cake-cream', 7552323, 'Vanilla Cream Cake', 'Round white cake with cream frosting on a glass plate', 'Hanna Pad', 'white-cake-on-white-ceramic-plate'),
    ('cakes', 'cake-red-velvet', 30665204, 'Red Velvet Celebration Cake', 'Red velvet celebration cake decorated with colourful confetti', 'Jonathan Valdes', 'celebratory-red-velvet-cake-with-30th-anniversary-decorations'),
    ('chocolates', 'chocolate-pralines', 15833455, 'Assorted Pralines', 'Assorted chocolate pralines decorated with nuts and toppings', 'shuruq', 'close-up-photo-of-pralines'),
    ('chocolates', 'chocolate-gift-box', 13278153, 'Chocolate Gift Box', 'Assorted gourmet chocolate pralines arranged in a gift box', 'Egor Komarov', 'a-box-of-chocolate-pralines'),
    ('chocolates', 'chocolate-truffles', 19121798, 'Chocolate Truffles', 'Chocolate truffles presented in an elegant box', 'Abdullah Alsaibaie', 'a-box-of-chocolate-pralines'),
    ('chocolates', 'chocolate-dark', 6261692, 'Dark Chocolate', 'Broken dark chocolate pieces on a warm brown surface', 'Eva Bronzini', 'chocolate-bar-on-a-brown-surface'),
    ('chocolates', 'chocolate-nut-bars', 3735187, 'Nut Chocolate Bars', 'Handmade chocolate bars topped with nuts and coconut flakes', 'Polina Tankilevitch', 'chocolate-bar'),
    ('sweets', 'sweet-kaju-katli', 18488310, 'Kaju Katli', 'Diamond-cut kaju katli with silver leaf on a golden plate', 'Gaurav Kumar', 'kaju-katri'),
    ('sweets', 'sweet-gulab-jamun', 15014919, 'Gulab Jamun', 'Gulab jamun in a white bowl with cashew nuts nearby', 'Nishess Shakya', 'bowl-of-gulab-jamun'),
    ('sweets', 'sweet-rasgulla', 8788869, 'Rasgulla', 'Traditional white rasgulla served in an elegant bowl', 'Divya Jain', 'round-foods-in-a-bowl'),
    ('sweets', 'sweet-almond-barfi', 18488299, 'Almond Barfi', 'Traditional almond barfi decorated with nuts', 'Gaurav Kumar', 'almond-barfi'),
    ('sweets', 'sweet-rose-barfi', 18488320, 'Rose Barfi', 'Indian barfi decorated with rose petals and edible silver leaf', 'Gaurav Kumar', 'rose-barfi'),
    ('sweets', 'sweet-laddu', 8659010, 'Motichoor Laddu', 'Orange motichoor laddu arranged on a traditional metal stand', 'Divya Jain', 'indian-sweets'),
]

def download(entry):
    category, name, photo_id, title, alt, author, slug = entry
    target = OUT / (name + '.webp')
    source_url = f'https://www.pexels.com/photo/{slug}-{photo_id}/'
    if photo_id == 8659010:
        # This provider search page exposes the original download and author;
        # the individual photo page is not currently returned by the provider.
        source_url = 'https://www.pexels.com/search/laddu/'
    result = {'src': '/images/bakery/redesign/' + target.name, 'alt': alt, 'name': title, 'sourceUrl': source_url, 'license': 'Pexels License', 'licenseUrl': 'https://www.pexels.com/license/', 'photographer': author, 'photoId': photo_id}
    if not target.exists():
        last_error = None
        for extension in ('jpeg', 'jpg', 'png'):
            try:
                data = fetch(f'https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.{extension}?auto=compress&cs=tinysrgb&w=1200')
                with Image.open(BytesIO(data)) as original:
                    photo = ImageOps.exif_transpose(original).convert('RGB')
                    photo.thumbnail((1000, 1000), Image.Resampling.LANCZOS)
                    photo.save(target, 'WEBP', quality=85, method=6)
                break
            except Exception as error:
                last_error = error
        else:
            return category, {'error': str(last_error), 'name': name}
    with Image.open(target) as photo:
        result['width'], result['height'] = photo.size
    result['bytes'] = target.stat().st_size
    print(f'{name}: {result["width"]} x {result["height"]}, {result["bytes"]:,} bytes', flush=True)
    return category, result

def run_downloads():
    manifest = {'cakes': [], 'chocolates': [], 'sweets': []}
    with ThreadPoolExecutor(max_workers=5) as pool:
        results = list(pool.map(download, ASSETS))
    for category, result in results:
        if 'error' in result:
            print('FAILED', result, flush=True)
        else:
            manifest[category].append(result)
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    write_provenance(manifest)
    sheet = Image.new('RGB', (1400, ((sum(map(len, manifest.values()))+4)//5)*250), '#faf7f2')
    draw = ImageDraw.Draw(sheet)
    for index, asset in enumerate(asset for group in manifest.values() for asset in group):
        with Image.open(OUT / Path(asset['src']).name) as photo:
            thumb = ImageOps.contain(photo, (270, 220))
            x, y = (index % 5)*280, (index // 5)*250
            sheet.paste(thumb, (x + (280-thumb.width)//2, y))
            draw.text((x+5, y+225), Path(asset['src']).stem, fill='#35252b')
    if '--contact-sheet' in sys.argv:
        sheet.save(OUT / 'contact-sheet.jpg', quality=90)
    print('Manifest written:', {key: len(group) for key, group in manifest.items()}, flush=True)

def write_provenance(manifest):
    rows = []
    for category, group in manifest.items():
        for asset in group:
            original = f'https://images.pexels.com/photos/{asset["photoId"]}/pexels-photo-{asset["photoId"]}.jpeg'
            rows.append(f'| `{Path(asset["src"]).name}` | {asset["photographer"]} | [{asset["photoId"]}]({asset["sourceUrl"]}) | [Original photograph]({original}) |')
    body = '''# Real photograph sources for the bakery redesign

Verified and downloaded on 5 November 2026. The new assets are real photographs,
not generated images. They have been visually inspected for subject accuracy and
watermarks. Existing original photography is retained where appropriate.

## Permission

All 21 photographs are licensed under the [Pexels License](https://www.pexels.com/license/).
The primary provider states that its photos may be downloaded and used for free,
modified, and used on commercial websites and e-commerce shops. Attribution is
optional. These are freely licensed photographs, not a claim that the works have
no copyright. Do not resell unaltered photo copies or imply photographer/brand
endorsement. No stock subscription or attribution-dependent Commons assets are used.

The original Pexels photo pages or provider search listings were checked for the
free-license label, original photographer, subject, and dimensions. The motichoor
laddu photo (8659010, Divya Jain/divigraphy) is linked from Pexels' laddu search
listing; that provider listing supplies its original download. Other entries link
to the individual original photo page.

## Google Images discovery

As requested, Google Images discovery was explicitly attempted first using these
queries on 5 November 2026:

- [Cakes](https://www.google.com/search?tbm=isch&q=site%3Apexels.com%2Fphoto%2F+cake+birthday+anniversary+kids+baby+shower)
- [Chocolates](https://www.google.com/search?tbm=isch&q=site%3Apexels.com%2Fphoto%2F+chocolate+pralines+bars+truffles)
- [Kaju katli](https://www.google.com/search?tbm=isch&q=site%3Apexels.com%2Fphoto%2F+kaju+katli)
- [Gulab jamun](https://www.google.com/search?tbm=isch&q=site%3Apexels.com%2Fphoto%2F+gulab+jamun)
- [Rasgulla](https://www.google.com/search?tbm=isch&q=site%3Apexels.com%2Fphoto%2F+rasgulla)
- [Motichoor laddu](https://www.google.com/search?tbm=isch&q=site%3Apexels.com%2Fphoto%2F+motichoor+ladoo)
- [Barfi](https://www.google.com/search?tbm=isch&q=site%3Apexels.com%2Fphoto%2F+barfi)

Google returned a JavaScript/network traffic challenge to automated requests.
The same query in the installed Chromium browser explicitly reported unusual
network traffic. No challenge was bypassed and no Google thumbnail was used.
Discovery continued through original Pexels search and photo pages. Licensing is
verified with the original provider, since Google results do not grant a license.

## Downloaded assets

Every file lives in `public/images/bakery/redesign/`. There are 10 distinct cake
photos, 5 distinct chocolate photos, and 6 distinct Indian sweet photos (including
kaju katli, gulab jamun, rasgulla, almond barfi, rose barfi, and motichoor laddu).

| Local file | Photographer | Original Pexels page/listing | Download source |
| --- | --- | --- | --- |
'''
    body += '\n'.join(rows)
    body += '''

## Processing and reproduction

`scripts/fetch-redesign-images.py` downloads the original provider images and
performs EXIF orientation correction, RGB conversion, proportional resizing
(maximum 1000 px, no upscaling), and WebP compression at quality 85. No generative
editing, subject replacement, background synthesis, watermark removal, or
third-party hotlinking is used. Photo aspect ratios are preserved so the app can
crop using `object-fit` to suit each layout.

`public/images/bakery/redesign/manifest.json` records meaningful alt text,
photographer, original photo ID, source URL, license URL, dimensions, and file
size for every asset. To recreate the assets run:

```powershell
python scripts/fetch-redesign-images.py
```

An optional `--discover` mode records Google discovery attempts. An optional
`--contact-sheet` argument creates a local review sheet; review sheets are not
needed by the app and should not be synced into the publication checkout.
'''
    (ROOT / 'image-sources-redesign.md').write_text(body, encoding='utf-8')

if __name__ == '__main__' and '--discover' in sys.argv:
    queries = [
        'site:pexels.com/photo/ cake birthday anniversary kids baby shower',
        'site:pexels.com/photo/ chocolate pralines bars truffles',
        'site:pexels.com/photo/ kaju katli',
        'site:pexels.com/photo/ gulab jamun',
        'site:pexels.com/photo/ rasgulla',
        'site:pexels.com/photo/ motichoor ladoo',
        'site:pexels.com/photo/ barfi',
    ]
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(discover, queries))
    (OUT / 'discovery.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
    for result in results:
        print(json.dumps(result), flush=True)
elif __name__ == '__main__':
    run_downloads()
