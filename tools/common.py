"""Helpers shared by the data tools: .env, the YouTube API and tracklist parsing."""
import json, pathlib, re, unicodedata, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENTS = ROOT / 'contents'


def env():
    out = {}
    path = ROOT / '.env'
    if path.exists():
        for line in path.read_text().splitlines():
            if '=' in line and not line.lstrip().startswith('#'):
                k, v = line.split('=', 1)
                out[k.strip()] = v.strip().strip('"\'')
    return out


def read_json(name):
    return json.loads((CONTENTS / name).read_text())


def write_json(name, data):
    (CONTENTS / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def secs(t):
    n = 0
    for p in t.split(':'):
        n = n * 60 + int(p)
    return n


def hms(sec):
    h, r = divmod(int(sec), 3600)
    m, s = divmod(r, 60)
    return f'{h}:{m:02d}:{s:02d}' if h else f'{m}:{s:02d}'


def iso_secs(d):
    m = re.fullmatch(r'P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', d or '')
    if not m:
        return None
    dd, h, mi, se = (int(x or 0) for x in m.groups())
    return ((dd * 24 + h) * 60 + mi) * 60 + se


def youtube_videos(ids, key, parts='snippet,status,contentDetails'):
    """videos.list for any number of ids (50 per request, 1 quota unit each)."""
    out = {}
    ids = list(dict.fromkeys(ids))
    for i in range(0, len(ids), 50):
        qs = urllib.parse.urlencode({'part': parts, 'id': ','.join(ids[i:i + 50]), 'maxResults': 50, 'key': key})
        data = json.load(urllib.request.urlopen(f'https://www.googleapis.com/youtube/v3/videos?{qs}', timeout=30))
        out.update({it['id']: it for it in data.get('items', [])})
    return out


def playable_problems(item):
    """Why a video would not play embedded in Brazil (empty when it plays)."""
    st, cd, probs = item.get('status', {}), item.get('contentDetails', {}), []
    if st.get('privacyStatus') == 'private':
        probs.append('private')
    if st.get('uploadStatus') not in (None, 'processed'):
        probs.append('not processed')
    if cd.get('contentRating', {}).get('ytRating') == 'ytAgeRestricted':
        probs.append('age-restricted')
    if st.get('embeddable') is False:
        probs.append('embedding disabled')
    reg = cd.get('regionRestriction', {})
    if 'BR' in reg.get('blocked', []) or ('allowed' in reg and 'BR' not in reg['allowed']):
        probs.append('blocked in Brazil')
    return probs


TIMESTAMP = re.compile(r"^\s*[\(\[]?((?:\d{1,2}:)?\d{1,2}:\d{2})[\)\]]?\s*[-–—|:.]?\s*(.+?)\s*$")


def parse_tracklist(description):
    """[(start_seconds, line)] from the timestamps in a video description."""
    tracks, last = [], -1
    for line in description.splitlines():
        m = TIMESTAMP.match(line)
        if not m:
            continue
        t, title = secs(m.group(1)), m.group(2).strip(' -–—')
        # ranges like "0:20 - 2:53 Artist": drop the end time
        title = re.sub(r'^(?:\d{1,2}:)?\d{1,2}:\d{2}\s*[-–—|]?\s*', '', title)
        # uploader markers that are not part of the name
        title = re.sub(r'\s*\[(?:BLOCKED|REMOVED|MUTED)\]\s*', ' ', title, flags=re.I).strip(' -–—')
        if t < last or not title:
            continue
        last = t
        tracks.append((t, title))
    return tracks


OTHER = re.compile(r'^\s*((intro|outro|ident|news|talk|jingle|interlude|station id|commercial( break)?( \d+)?|ad break|'
                   r'weazel( news| weather)?( promo)?)\s*$|(commercial|advert|ad|promo)\s*[-:–—])', re.I)
PLACEHOLDER = re.compile(r'^track \d+$', re.I)
SEP = re.compile(r'\s+[-–—]\s+')
SEP_LOOSE = re.compile(r'\s*[-–—]\s+')
BY = re.compile(r'^"(.+?)"\s*(?:\([^)]*\)\s*)?by\s+(.+)$')


def clean_line(raw):
    return re.sub(r'https?://\S+', '', re.sub(r'^\s*(\(x\)|\|)\s*', '', raw)).strip()


def split_line(raw):
    """A guess of (title, artist) from a tracklist line. The order is not reliable: uploaders write
    either "Title - Artist" or "Artist - Title", so callers must try both."""
    text = clean_line(raw)
    m = BY.match(text)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    parts = SEP.split(text, maxsplit=1)
    if len(parts) == 1:
        parts = SEP_LOOSE.split(text, maxsplit=1)
    title, artist = (parts + [''])[:2]
    return title.strip(), artist.strip()


def new_song(raw, song_id, talk=False, station_names=()):
    """A songs.json entry for a new tracklist line."""
    text = clean_line(raw)
    other = talk or OTHER.match(text) or PLACEHOLDER.match(text) or text.lower() in station_names
    return {'id': song_id, 'raw': raw, 'kind': 'other' if other else 'song',
            'spotify_id': None, 'spotify_title': None, 'spotify_artist': None, 'spotify_checked': False}
