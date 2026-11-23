"""Baixa a descrição de cada vídeo e extrai a tracklist (timestamps) para tracks.js.

Uso: python3 tools/build_tracks.py   (na raiz do projeto)
"""
import json, re, urllib.request, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / 'stations.js').read_text()
ids = re.findall(r"id: '([\w-]{11})'", src)

TS = re.compile(r"^\s*[\(\[]?((?:\d{1,2}:)?\d{1,2}:\d{2})[\)\]]?\s*[-–—|:.]?\s*(.+?)\s*$")

def secs(t):
    n = 0
    for p in t.split(':'):
        n = n * 60 + int(p)
    return n

def fetch(vid):
    req = urllib.request.Request(f'https://www.youtube.com/watch?v={vid}&hl=en',
        headers={'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en', 'Cookie': 'CONSENT=YES+1'})
    html = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')
    m = re.search(r'"shortDescription":"((?:[^"\\]|\\.)*)"', html)
    return json.loads('"' + m.group(1) + '"') if m else ''

out = {}
for vid in ids:
    desc = fetch(vid)
    tracks, last = [], -1
    for line in desc.splitlines():
        m = TS.match(line)
        if not m:
            continue
        t, title = secs(m.group(1)), m.group(2).strip(' -–—')
        # intervalos "0:20 - 2:53 Artista": descarta o tempo final
        title = re.sub(r'^(?:\d{1,2}:)?\d{1,2}:\d{2}\s*[-–—|]?\s*', '', title)
        # marcações do uploader que não são parte do nome
        title = re.sub(r'\s*\[(?:BLOCKED|REMOVED|MUTED)\]\s*', ' ', title, flags=re.I).strip(' -–—')
        if t < last or not title:
            continue
        last = t
        tracks.append([t, title])
    out[vid] = tracks
    print(f'{vid}: {len(tracks)} faixas')

(ROOT / 'tracks.js').write_text(
    '// Gerado por tools/build_tracks.py a partir das descrições dos vídeos. Não editar à mão.\n'
    'window.TRACKS = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
