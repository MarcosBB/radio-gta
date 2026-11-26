# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=10"]
# ///
"""Compare each station's theme colors with the colors of its logo.

Usage: uv run tools/logo_colors.py                     (writes logo-colors.html and lists mismatches)
       uv run tools/logo_colors.py --apply ID [ID ...] (use the logo colors for these stations)
       uv run tools/logo_colors.py --apply-all         (use the logo colors for every mismatch)

The two theme colors in contents/stations.json (`colors`) tint the background glow, the
accents and the badge of stations without a logo. This reads each logo (SVGs are rendered with
rsvg-convert), ignores transparent, near-black, near-white and grey pixels, and takes the two
most common remaining colors. A station is a mismatch when its first theme color is far from
every main color of its logo. Logos that are only black, white or grey are skipped.
"""
import argparse, colorsys, html, io, json, pathlib, subprocess, sys
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
STATIONS = ROOT / 'contents' / 'stations.json'
REPORT = ROOT / 'logo-colors.html'
FAR = 80


def load(path):
    if path.suffix == '.svg':
        png = subprocess.run(['rsvg-convert', '-w', '128', str(path)], capture_output=True, check=True).stdout
        return Image.open(io.BytesIO(png)).convert('RGBA')
    return Image.open(path).convert('RGBA')


def hexc(rgb):
    return '#%02x%02x%02x' % rgb


def rgb_of(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def dist(a, b):
    # weighted RGB distance, close enough to perceived difference for this purpose
    r = (a[0] + b[0]) / 2
    dr, dg, db = a[0] - b[0], a[1] - b[1], a[2] - b[2]
    return ((2 + r / 256) * dr * dr + 4 * dg * dg + (2 + (255 - r) / 256) * db * db) ** 0.5 / 3


def logo_colors(img):
    img = img.copy()
    img.thumbnail((96, 96))
    pixels = []
    for r, g, b, a in img.convert("RGBA").get_flattened_data():
        if a < 160:
            continue
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        if l < 0.12 or l > 0.92 or s < 0.25:
            continue
        pixels.append((r, g, b))
    if len(pixels) < 30:
        return []
    swatch = Image.new('RGB', (len(pixels), 1))
    swatch.putdata(pixels)
    pal = swatch.quantize(colors=6, method=Image.Quantize.MEDIANCUT)
    palette = pal.getpalette()
    # Rank by share, but favour vivid mid-tone colors over dark or washed-out shades of the logo.
    ranked = []
    for count, idx in pal.getcolors():
        c = tuple(palette[idx * 3: idx * 3 + 3])
        share = count / len(pixels)
        if share < 0.04:
            continue
        _, l, sat = colorsys.rgb_to_hls(*(v / 255 for v in c))
        ranked.append((share * sat ** 1.5 * (1 - abs(l - 0.55)), c))
    out = []
    for _, c in sorted(ranked, reverse=True):
        if any(dist(c, o) < 45 for o in out):
            continue
        out.append(c)
    return out[:3]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', nargs='+', metavar='ID', help='station ids to recolor from their logo')
    ap.add_argument('--apply-all', action='store_true', help='recolor every mismatch')
    args = ap.parse_args()

    stations = json.loads(STATIONS.read_text())
    rows, mismatches = [], []
    for st in stations:
        if not st.get('logo'):
            continue
        found = logo_colors(load(ROOT / 'public' / st['logo']))
        if not found:
            continue
        current = [rgb_of(c) for c in st['colors']]
        gap = min(dist(current[0], c) for c in found)
        suggested = [hexc(found[0]), hexc(found[1] if len(found) > 1 else current[1])]
        bad = gap > FAR
        if bad:
            mismatches.append((st, suggested))
        rows.append((st, found, suggested, gap, bad))

    targets = {s['id'] for s, _ in mismatches} if args.apply_all else set(args.apply or [])
    if targets:
        for st, _, suggested, _, _ in rows:
            if st['id'] in targets:
                st['colors'] = suggested
        STATIONS.write_text(json.dumps(stations, ensure_ascii=False, indent=2) + '\n')
        print(f'recolored {len(targets)} stations')
        return

    sw = lambda c: f'<span class="sw" style="background:{c}" title="{c}"></span>'
    body = []
    for st, found, suggested, gap, bad in sorted(rows, key=lambda r: -r[3]):
        body.append(
            f'<tr class="{"bad" if bad else ""}"><td><img src="public/{html.escape(st["logo"])}"></td>'
            f'<td><b>{html.escape(st["name"])}</b><br><code>{st["id"]}</code></td>'
            f'<td>{"".join(sw(c) for c in st["colors"])}</td><td>{"".join(sw(hexc(c)) for c in found)}</td>'
            f'<td>{"".join(sw(c) for c in suggested)}</td><td>{gap:.0f}</td></tr>')
    REPORT.write_text(f"""<!doctype html><meta charset="utf-8"><title>Logo colors</title>
<style>body{{font:14px system-ui;background:#0b0b10;color:#eee;margin:24px}}table{{border-collapse:collapse}}
td,th{{padding:8px 12px;border-bottom:1px solid #222;text-align:left;vertical-align:middle}}
img{{width:56px;height:56px;object-fit:contain;background:#1a1a22;border-radius:50%;padding:6px}}
.sw{{display:inline-block;width:34px;height:34px;border-radius:8px;margin-right:6px;border:1px solid #fff3}}
tr.bad td:first-child{{box-shadow:inset 4px 0 #ff4d4d}}code{{color:#999}}</style>
<h1>Logo colors</h1><p>{len(mismatches)} of {len(rows)} stations have a first color far from their logo (red mark). Stations without a logo or with a black/white logo are not listed.</p>
<table><tr><th></th><th>Station</th><th>Now</th><th>Logo</th><th>Suggested</th><th>Gap</th></tr>{''.join(body)}</table>""")
    print(f'{len(mismatches)} of {len(rows)} stations have colors far from their logo; see {REPORT.name}')
    for st, suggested in mismatches:
        print(f"  {st['id']}: {st['colors']} → {suggested}")


if __name__ == '__main__':
    main()
