"""Fill spotify_id, spotify_title and spotify_artist in contents/songs.json from the Spotify Web API.

Usage: python3 tools/build_spotify.py            (from the project root)
       python3 tools/build_spotify.py --retry    (also retry songs that were not found before)

Needs SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env (client credentials flow; the app owner
must have Spotify Premium). Songs with spotify_checked: true are never touched, so fix a wrong match
by hand and set that flag. Progress is saved as it goes, so the script can be stopped and resumed.

Requests are paced (one every 2 s by default) and a run stops after 600 requests, because
Spotify answers bursts with a block of up to a day. If it still gets rate limited, it waits
the time Spotify asks and halves its pace.
Low-confidence matches and misses are listed in spotify-report.md.
"""
import argparse, base64, difflib, json, pathlib, re, sys, time, unicodedata, urllib.error, urllib.parse, urllib.request

from common import split_line

ROOT = pathlib.Path(__file__).resolve().parent.parent
SONGS = ROOT / 'contents' / 'songs.json'
REPORT = ROOT / 'spotify-report.md'
# Requests sent during a block seem to restart it, so the end of a block is remembered here.
BLOCKED_UNTIL = ROOT / '.spotify-blocked-until'


def env():
    out = {}
    for line in (ROOT / '.env').read_text().splitlines():
        if '=' in line and not line.lstrip().startswith('#'):
            k, v = line.split('=', 1)
            out[k.strip()] = v.strip().strip('"\'')
    return out


class QuotaExhausted(Exception):
    pass


class BudgetUsed(Exception):
    pass


class Spotify:
    # Spotify counts requests in a rolling 30-second window and answers bursts with a
    # Retry-After that can be a whole day, so requests are paced instead of retried.
    def __init__(self, cid, secret, interval, budget):
        self.auth = base64.b64encode(f'{cid}:{secret}'.encode()).decode()
        self.token, self.expires = None, 0
        self.interval, self.budget, self.sent, self.last = interval, budget, 0, 0.0

    def _pace(self):
        if self.sent >= self.budget:
            raise BudgetUsed()
        wait = self.last + self.interval - time.monotonic()
        if wait > 0:
            time.sleep(wait)
        self.last = time.monotonic()
        self.sent += 1

    def _token(self):
        if time.time() < self.expires - 60:
            return self.token
        req = urllib.request.Request('https://accounts.spotify.com/api/token', data=b'grant_type=client_credentials',
                                     headers={'Authorization': 'Basic ' + self.auth, 'Content-Type': 'application/x-www-form-urlencoded'})
        data = json.load(urllib.request.urlopen(req, timeout=30))
        self.token, self.expires = data['access_token'], time.time() + data['expires_in']
        return self.token

    def search(self, q):
        url = 'https://api.spotify.com/v1/search?' + urllib.parse.urlencode({'q': q, 'type': 'track', 'limit': 10})
        for attempt in range(6):
            self._pace()
            req = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + self._token()})
            try:
                return json.load(urllib.request.urlopen(req, timeout=30))['tracks']['items']
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    wait = int(e.headers.get('Retry-After', '5')) + 1
                    reason = reason_of(e)
                    # Development-mode apps have a quota separate from the 30-second rate limit;
                    # Spotify marks it with reason QUOTA_EXCEEDED and does not publish its size.
                    if reason == 'QUOTA_EXCEEDED' or wait > 300:
                        raise QuotaExhausted(wait, reason, self.sent)
                    self.interval *= 2
                    print(f'  rate limit (30-second window, reason {reason or "none"}) after {self.sent} requests: '
                          f'waiting {wait}s, now one request every {self.interval:.0f}s', flush=True)
                    time.sleep(wait)
                elif e.code >= 500:
                    time.sleep(2 ** attempt)
                elif e.code == 401:
                    self.expires = 0
                else:
                    raise
            except (urllib.error.URLError, TimeoutError):
                time.sleep(2 ** attempt)
        return []


def reason_of(error):
    try:
        body = json.loads(error.read().decode() or '{}')
    except (ValueError, OSError):
        return None
    err = body.get('error')
    return (err.get('reason') if isinstance(err, dict) else None) or body.get('reason')


def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    s = re.sub(r"['’`]", '', s)
    s = re.sub(r'\((?:feat|ft|with|prod)[^)]*\)|\[[^\]]*\]', ' ', s)
    s = re.sub(r'\s+-\s+(?:\d{4}\s+)?(?:remaster(?:ed)?|single|radio|album|original|mono|stereo|edit|version|mix).*$', ' ', s)
    s = re.sub(r'\(\s*(?:\d{4}\s+)?(?:remaster(?:ed)?|single version|radio edit|album version|original mix|mono|stereo)[^)]*\)', ' ', s)
    s = re.sub(r'\(\d{4}\)', ' ', s)
    s = s.replace('&', ' and ')
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


def split_artists(s):
    s = re.sub(r'\(\d{4}\)', ' ', s)
    parts = re.split(r'\s*(?:,|&|/|\bfeat\.?|\bft\.?|\bfeaturing\b|\bvs\.?|\bx\b|\band\b|\bwith\b)\s*', s, flags=re.I)
    return [norm(p) for p in parts if norm(p)]


def clean_title(s):
    s = re.sub(r'\(\d{4}\)|["“”]', ' ', s)
    s = re.sub(r'\s*\((?:feat|ft)[^)]*\)', ' ', s, flags=re.I)
    s = re.sub(r'\s+(?:feat|ft)\.?\s.*$', ' ', s, flags=re.I)
    return re.sub(r'\s+', ' ', s).strip()


LIVE = re.compile(r'\blive\b|\bacoustic\b|\bkaraoke\b|\binstrumental\b|\bcover\b', re.I)
REMASTER = re.compile(r'\s+-\s+(?:\d{4}\s+)?remaster(?:ed)?(?:\s+\d{4})?(?:\s+version)?$|\s*\((?:\d{4}\s+)?remaster(?:ed)?(?:\s+\d{4})?(?:\s+version)?\)$', re.I)


def display_title(name):
    return REMASTER.sub('', name).strip()


def score(track, title, artists):
    base = re.sub(r'\s*\([^)]*\)\s*$|\s+-\s+.*$', '', track['name'])
    t = max(difflib.SequenceMatcher(None, norm(n), norm(title)).ratio() for n in (track['name'], base))
    if LIVE.search(track['name']) and not LIVE.search(title):
        t -= 0.2
    sp = [norm(a['name']) for a in track['artists']]
    a = 0.0
    for mine in artists:
        for theirs in sp:
            if mine and theirs and (mine == theirs or mine in theirs or theirs in mine):
                a = 1.0
            else:
                a = max(a, difflib.SequenceMatcher(None, mine, theirs).ratio())
    return t, a


def best(sp, title, artist):
    title = clean_title(title)
    artists = split_artists(artist)
    if not title or not artists:
        return None, 0, 0
    first_artist = re.split(r'\s*(?:,|&|/|feat\.?|ft\.?)\s*', artist, flags=re.I)[0].strip()
    queries = [f'track:"{title}" artist:"{first_artist}"', f'{title} {first_artist}']
    top = (None, 0, 0)
    for q in queries:
        for tr in sp.search(q):
            t, a = score(tr, title, artists)
            if (t + a) > (top[1] + top[2]) or (t + a == top[1] + top[2] and top[0] and tr.get('popularity', 0) > top[0].get('popularity', 0)):
                top = (tr, t, a)
        if top[0] and top[1] >= 0.9 and top[2] >= 0.9:
            break
    return top


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--retry', action='store_true', help='retry songs already tried without a match')
    ap.add_argument('--limit', type=int, help='stop after this many songs')
    ap.add_argument('--interval', type=float, default=2.0, help='seconds between requests (default 2)')
    ap.add_argument('--max-requests', type=int, default=600, help='requests per run (default 600)')
    args = ap.parse_args()
    keys = env()
    if not keys.get('SPOTIFY_CLIENT_ID') or not keys.get('SPOTIFY_CLIENT_SECRET'):
        sys.exit('SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are missing in .env')
    if BLOCKED_UNTIL.exists() and time.time() < float(BLOCKED_UNTIL.read_text()):
        left = (float(BLOCKED_UNTIL.read_text()) - time.time()) / 3600
        sys.exit(f'Spotify is still blocking the app for about {left:.1f} h. Not sending any request.')
    sp = Spotify(keys['SPOTIFY_CLIENT_ID'], keys['SPOTIFY_CLIENT_SECRET'], args.interval, args.max_requests)
    songs = json.loads(SONGS.read_text())
    todo = [s for s in songs if s['kind'] == 'song' and not s.get('spotify_checked') and not s.get('spotify_id')
            and (args.retry or not s.get('spotify_tried'))]
    if args.limit is not None:
        todo = todo[:args.limit]
    print(f'{len(todo)} songs to look up', flush=True)
    for n, s in enumerate(todo, 1):
        try:
            title, artist = split_line(s['raw'])
            found = best(sp, title, artist)
            good = found[0] and found[1] >= 0.85 and found[2] >= 0.85
            swapped = (None, 0, 0) if good else best(sp, artist, title)
        except BudgetUsed:
            SONGS.write_text(json.dumps(songs, ensure_ascii=False, indent=2) + '\n')
            write_report(songs)
            left = len(todo) - n + 1
            sys.exit(f'Stopped after {sp.sent} requests ({n - 1} songs), {left} left. Run it again later; it resumes where it stopped.')
        except QuotaExhausted as e:
            SONGS.write_text(json.dumps(songs, ensure_ascii=False, indent=2) + '\n')
            write_report(songs)
            wait, reason, sent = e.args
            BLOCKED_UNTIL.write_text(str(time.time() + wait))
            kind = 'development-mode quota (QUOTA_EXCEEDED)' if reason == 'QUOTA_EXCEEDED' else f'rate limit (reason {reason or "none"})'
            sys.exit(f'Spotify blocked the app: {kind}, after {sent} requests and {n - 1} songs in this run. '
                     f'Retry-After is {wait}s (about {wait / 3600:.1f} h). Run it again then; it resumes where it stopped.')
        tr, t, a = max([found, swapped], key=lambda x: x[1] + x[2])
        s['spotify_tried'] = True
        s.pop('spotify_doubt', None)
        if tr and t >= 0.85 and a >= 0.85:
            s['spotify_id'] = tr['id']
            s['spotify_title'] = display_title(tr['name'])
            s['spotify_artist'] = ', '.join(x['name'] for x in tr['artists'])
        elif tr and t >= 0.6 and a >= 0.6:
            s['spotify_doubt'] = {'id': tr['id'], 'title': tr['name'], 'artist': ', '.join(x['name'] for x in tr['artists'])}
        if n % 25 == 0 or n == len(todo):
            SONGS.write_text(json.dumps(songs, ensure_ascii=False, indent=2) + '\n')
            print(f'{n}/{len(todo)}', flush=True)
    write_report(songs)


def write_report(songs):
    matched = [s for s in songs if s.get('spotify_id')]
    doubt = [s for s in songs if not s.get('spotify_id') and s.get('spotify_doubt')]
    missing = [s for s in songs if s['kind'] == 'song' and not s.get('spotify_id') and not s.get('spotify_doubt') and s.get('spotify_tried')]
    lines = ['# Spotify report', '', 'Generated by `tools/build_spotify.py`.', '',
             f'- Matched: {len(matched)}', f'- Possible matches to review: {len(doubt)}', f'- Not found: {len(missing)}', '',
             'To accept or fix a song, set `spotify_id`, `spotify_title` and `spotify_artist` in `contents/songs.json` and `"spotify_checked": true`.', '',
             '## Possible matches', '', '| Song id | Tracklist line | Spotify candidate |', '|---|---|---|']
    for s in doubt:
        d = s['spotify_doubt']
        lines.append(f"| `{s['id']}` | {s['raw']} | [{d['title']} · {d['artist']}](https://open.spotify.com/track/{d['id']}) |")
    lines += ['', '## Not found', '', '| Song id | Tracklist line |', '|---|---|']
    lines += [f"| `{s['id']}` | {s['raw']} |" for s in missing]
    REPORT.write_text('\n'.join(lines) + '\n')
    print(f'matched {len(matched)}, to review {len(doubt)}, not found {len(missing)}')


if __name__ == '__main__':
    main()
