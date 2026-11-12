"""Reproduce locally stored licensed bakery photograph assets."""
from pathlib import Path
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps, ImageDraw
import json
import urllib.parse
import re

ROOT = Path(__file__).resolve().parents[1]
ORIGINALS = ROOT / '.asset-originals'
ORIGINALS.mkdir(exist_ok=True)

def download_pexels(photo_id):
    target = ORIGINALS / f'{photo_id}.jpg'
    if target.exists():
        return f'{photo_id}: cached'
    for extension in ('jpeg', 'jpg', 'png'):
        url = f'https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.{extension}'
        try:
            response = urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=40)
            data = response.read()
            target.write_bytes(data)
            with Image.open(target) as im:
                dimensions = im.size
            return f'{photo_id}: {dimensions}, {len(data)} bytes'
        except Exception as error:
            last_error = error
    return f'{photo_id}: FAILED {last_error}'

if __name__ == '__main__':
    try:
        google_url = 'https://www.google.com/search?tbm=isch&q=' + urllib.parse.quote('site:pexels.com bakery artisan bread croissant dark')
        html = urlopen(Request(google_url, headers={'User-Agent':'Mozilla/5.0'}), timeout=30).read().decode('utf-8', 'replace')
        (ORIGINALS / 'google-image-discovery.html').write_text(html, encoding='utf-8')
        print('Google Images discovery:', len(html), 'characters', flush=True)
    except Exception as e:
        print('Google Images discovery unavailable:', e, flush=True)
    extra = {'almond-croissants':'https://images.unsplash.com/photo-1727828659447-9ba18b9f9cdc', 'rustic-loaf':'https://images.unsplash.com/photo-1511629036492-6c07153d3e83', 'sliced-breads':'https://images.unsplash.com/photo-1533782654613-826a072dd6f3'}
    for name, url in extra.items():
        out = ORIGINALS / f'{name}.jpg'
        if not out.exists():
            try:
                out.write_bytes(urlopen(Request(url, headers={'User-Agent':'Mozilla/5.0'}), timeout=40).read())
            except Exception as e: print(name, e, flush=True)
    ids = [4881596,16543194,291528,29538420,7966067,20473669,3218467,5507697,16026792,3850349]
    with ThreadPoolExecutor(max_workers=5) as pool:
        for result in pool.map(download_pexels, ids):
            print(result, flush=True)
    ids += list(extra)
    sheet = Image.new('RGB', (1200, ((len(ids)+2)//3)*320), '#efe9df')
    draw = ImageDraw.Draw(sheet)
    for index, photo_id in enumerate(ids):
        p = ORIGINALS / f'{photo_id}.jpg'
        if not p.exists(): continue
        with Image.open(p) as im:
            preview = ImageOps.contain(ImageOps.exif_transpose(im).convert('RGB'), (390,280))
            x, y = (index%3)*400, (index//3)*320
            sheet.paste(preview, (x + (400-preview.width)//2,y))
            draw.text((x+15,y+287), str(photo_id), fill='#111111')
    sheet.save(ORIGINALS / 'contact-sheet.jpg')
