# /// script
# requires-python = ">=3.10"
# dependencies = ["rich>=13"]
# ///
"""Check that both videos of every station still play in the embedded player.

Usage: uv run tools/check_videos.py                (from the project root)
       uv run tools/check_videos.py --pages        (force the mode without an API key)
       uv run tools/check_videos.py --pages -j 2   (2 pages at a time; default 4)

Every station has two videos: the primary and a fallback the site switches to when the first
fails. Each video is checked for being removed, private or unavailable, age-restricted (does not
play embedded), embedding disabled by the owner, blocked in Brazil, or a changed duration (the
live position uses the duration in contents/stations.json).

Per station:
  - OK: both videos play.
  - Warning: one video fails (the station still plays, but needs a new video), the duration of
    a video changed, or the station has no fallback video yet.
  - Error: both videos fail and the station is silent.

Two modes:
  - YouTube Data API v3 (default when there is a key): 50 videos per request. The key comes from
    YOUTUBE_API_KEY (environment variable or a YOUTUBE_API_KEY=... line in the .env at the root).
  - Pages (no key): opens each video page and reads playabilityStatus. If YouTube rate limits,
    it waits and retries; if it keeps failing, the rest is reported as unverified.
Writes video-report.md at the root. Exit code: 0 all OK, 1 some station with an error,
2 no errors but unverified videos, 3 only warnings.
"""
import argparse, json, os, pathlib, re, sys, threading, time, urllib.error, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

from rich.console import Console
from rich.progress import BarColumn, MofNCompleteColumn, Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from rich.table import Table

ROOT = pathlib.Path(__file__).resolve().parent.parent
REPORT = ROOT / 'video-report.md'
DURATION_TOLERANCE = 5
RETRY_WAITS = [5, 15, 30]
API_BATCH = 50
OK, FAILED, CHANGED, UNVERIFIED = 'ok', 'failed', 'changed', 'unverified'
STATION_OK, STATION_WARNING, STATION_ERROR, STATION_UNVERIFIED = 'ok', 'warning', 'error', 'unverified'
console = Console()


class Blocked(Exception):
    pass


def secs(t):
    n = 0
    for p in t.split(':'):
        n = n * 60 + int(p)
    return n


def fmt(s):
    h, r = divmod(s, 3600)
    return f'{h}:{r // 60:02}:{r % 60:02}' if h else f'{r // 60}:{r % 60:02}'


def load_stations():
    stations = json.loads((ROOT / 'contents' / 'stations.json').read_text())
    for st in stations:
        st['checks'] = [{'station': st, 'slot': 'primary' if i == 0 else 'fallback', 'vid': v['youtube_id'],
                         'dur': secs(v['duration'])} for i, v in enumerate(st['videos'])]
    return stations


def fetch_page(vid):
    req = urllib.request.Request(f'https://www.youtube.com/watch?v={vid}&hl=en',
                                 headers={'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en', 'Cookie': 'CONSENT=YES+1'})
    try:
        r = urllib.request.urlopen(req, timeout=30)
    except urllib.error.HTTPError as ex:
        if ex.code == 429:
            raise Blocked('YouTube rate limited the requests (429)')
        raise
    if 'google.com/sorry' in r.geturl():
        raise Blocked('YouTube asked for a captcha')
    return r.read().decode('utf-8', 'replace')


def duration_problem(video, real):
    if real and abs(real - video['dur']) > DURATION_TOLERANCE:
        return f"duration changed: stations.json {fmt(video['dur'])}, video {fmt(real)} → \"duration\": \"{fmt(real)}\""
    return None


def check_page(video):
    html = fetch_page(video['vid'])
    m = re.search(r'var ytInitialPlayerResponse = (\{.*?\});(?:var |</script>)', html)
    if not m:
        return UNVERIFIED, ['page without player data (did YouTube change the format?)']
    p = json.loads(m.group(1))
    ps = p.get('playabilityStatus', {})
    status, reason = ps.get('status'), ps.get('reason') or ''
    fails = []
    if status == 'LOGIN_REQUIRED':
        fails.append(f'login required: {reason}' if reason else 'login required')
    elif status != 'OK':
        fails.append(f'{status}: {reason}'.rstrip(': '))
    elif not ps.get('playableInEmbed'):
        fails.append('embedding disabled by the owner')
    countries = p.get('microformat', {}).get('playerMicroformatRenderer', {}).get('availableCountries')
    if countries and 'BR' not in countries:
        fails.append('blocked in Brazil')
    if fails:
        return FAILED, fails
    real = p.get('videoDetails', {}).get('lengthSeconds')
    changed = duration_problem(video, int(real) if real else None)
    return (CHANGED, [changed]) if changed else (OK, [])


def api_key():
    if os.environ.get('YOUTUBE_API_KEY'):
        return os.environ['YOUTUBE_API_KEY'].strip()
    env = ROOT / '.env'
    if env.exists():
        for line in env.read_text().splitlines():
            k, _, v = line.partition('=')
            if k.strip() == 'YOUTUBE_API_KEY' and v.strip():
                return v.strip().strip('"\'')
    return None


def iso_secs(d):
    m = re.fullmatch(r'P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', d or '')
    if not m:
        return None
    dd, h, mi, se = (int(x or 0) for x in m.groups())
    return ((dd * 24 + h) * 60 + mi) * 60 + se


def check_api_batch(batch, key):
    qs = urllib.parse.urlencode({'part': 'status,contentDetails', 'id': ','.join(v['vid'] for v in batch),
                                 'maxResults': API_BATCH, 'key': key})
    try:
        r = urllib.request.urlopen(f'https://www.googleapis.com/youtube/v3/videos?{qs}', timeout=30)
        items = {it['id']: it for it in json.load(r).get('items', [])}
    except urllib.error.HTTPError as ex:
        try:
            err = json.load(ex)['error']
            msg = f"YouTube API: {err.get('message', ex)}"
        except Exception:
            msg = f'YouTube API: {ex}'
        return [(v, UNVERIFIED, [msg]) for v in batch]
    except Exception as ex:
        return [(v, UNVERIFIED, [f'API request failed: {ex}']) for v in batch]

    out = []
    for v in batch:
        it = items.get(v['vid'])
        if not it:
            out.append((v, FAILED, ['removed or unavailable']))
            continue
        st, cd, fails = it.get('status', {}), it.get('contentDetails', {}), []
        if st.get('privacyStatus') == 'private':
            fails.append('private video')
        if st.get('uploadStatus') not in (None, 'processed'):
            fails.append(f"upload {st['uploadStatus']}")
        if cd.get('contentRating', {}).get('ytRating') == 'ytAgeRestricted':
            fails.append('age-restricted (does not play embedded)')
        if st.get('embeddable') is False:
            fails.append('embedding disabled by the owner')
        reg = cd.get('regionRestriction', {})
        if 'BR' in reg.get('blocked', []) or ('allowed' in reg and 'BR' not in reg['allowed']):
            fails.append('blocked in Brazil')
        if fails:
            out.append((v, FAILED, fails))
            continue
        changed = duration_problem(v, iso_secs(cd.get('duration')))
        out.append((v, CHANGED, [changed]) if changed else (v, OK, []))
    return out


def station_state(st, results):
    states = [results[v['vid']][0] for v in st['checks']]
    working = [s for s in states if s in (OK, CHANGED)]
    if len(st['checks']) and states.count(FAILED) == len(states):
        return STATION_ERROR
    if UNVERIFIED in states and not working:
        return STATION_UNVERIFIED
    if FAILED in states or CHANGED in states or len(st['checks']) < 2:
        return STATION_WARNING
    if UNVERIFIED in states:
        return STATION_UNVERIFIED
    return STATION_OK


def station_notes(st, results):
    notes = []
    for v in st['checks']:
        state, msgs = results[v['vid']]
        if state != OK:
            notes += [f"{v['slot']} [{v['vid']}](https://youtu.be/{v['vid']}): {m}" for m in msgs]
    if len(st['checks']) < 2:
        notes.append('no fallback video yet')
    return notes


ICON = {STATION_OK: '✅', STATION_WARNING: '⚠️', STATION_ERROR: '❌', STATION_UNVERIFIED: '❔'}
COLOR = {STATION_OK: 'green', STATION_WARNING: 'yellow', STATION_ERROR: 'red', STATION_UNVERIFIED: 'magenta'}


def write_report(stations, results, states, elapsed):
    count = {s: sum(1 for x in states.values() if x == s) for s in ICON}
    md = ['# Video report', '', f'Generated by `tools/check_videos.py` on {datetime.now():%Y-%m-%d %H:%M} ({elapsed:.0f}s).', '',
          f"**{count[STATION_OK]}/{len(stations)} stations OK**, {count[STATION_WARNING]} with warnings, "
          f"{count[STATION_ERROR]} with errors, {count[STATION_UNVERIFIED]} unverified.", '']
    for state, title in [(STATION_ERROR, 'Errors: both videos fail, the station is silent'),
                         (STATION_WARNING, 'Warnings: the station plays, but a video needs attention'),
                         (STATION_UNVERIFIED, 'Unverified (run again later)')]:
        sel = [st for st in stations if states[st['id']] == state]
        if not sel:
            continue
        md += [f'## {title}', '', '| Game | Station | Notes |', '|---|---|---|']
        md += [f"| {st['game']} | {st['name']} | {'<br>'.join(station_notes(st, results))} |" for st in sel]
        md.append('')
    md += ['## All stations', '']
    game = None
    for st in stations:
        if st['game'] != game:
            game = st['game']
            md += ['', f'### {game}', '', '| | Station | Primary | Fallback |', '|---|---|---|---|']
        cols = [f"[{v['vid']}](https://youtu.be/{v['vid']}) {fmt(v['dur'])}" for v in st['checks']] + ['—', '—']
        md.append(f"| {ICON[states[st['id']]]} | {st['name']} | {cols[0]} | {cols[1]} |")
    REPORT.write_text('\n'.join(md) + '\n')
    return count


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--pages', action='store_true', help='do not use the API; open each video page')
    ap.add_argument('-j', '--jobs', type=int, default=4, help='pages mode: how many at a time')
    args = ap.parse_args()

    stations = load_stations()
    videos = [v for st in stations for v in st['checks']]
    key = None if args.pages else api_key()
    if not key and not args.pages:
        console.print('[yellow]No YOUTUBE_API_KEY: opening each video page (slower, and YouTube may block).[/]')
    stop = threading.Event()
    results = {}

    def page(v):
        for wait in RETRY_WAITS + [None]:
            if stop.is_set():
                return v, UNVERIFIED, ['YouTube blocked the requests']
            try:
                state, msgs = check_page(v)
                return v, state, msgs
            except Blocked as ex:
                if wait is None:
                    stop.set()
                    return v, UNVERIFIED, [str(ex)]
                stop.wait(wait)
            except Exception as ex:
                return v, UNVERIFIED, [f'request failed: {ex}']

    batches = [videos[i:i + API_BATCH] for i in range(0, len(videos), API_BATCH)] if key else [[v] for v in videos]
    start = time.monotonic()
    progress = Progress(SpinnerColumn(), TextColumn('[bold]Checking videos'), BarColumn(), MofNCompleteColumn(), TimeElapsedColumn(),
                        console=console, transient=True)
    with progress, ThreadPoolExecutor(len(batches) if key else args.jobs) as pool:
        task = progress.add_task('', total=len(videos))
        futures = [pool.submit(check_api_batch, b, key) if key else pool.submit(lambda b: [page(b[0])], b) for b in batches]
        for fut in as_completed(futures):
            for v, state, msgs in fut.result():
                results[v['vid']] = (state, msgs)
                progress.advance(task)
    elapsed = time.monotonic() - start

    states = {st['id']: station_state(st, results) for st in stations}
    for st in stations:
        state = states[st['id']]
        if state != STATION_OK:
            console.print(f"[{COLOR[state]}]{ICON[state]} {st['game']:7} {st['name']}[/]")
            for note in station_notes(st, results):
                console.print(f'          [dim]{note}[/]', highlight=False)

    table = Table(title='Summary by game', title_justify='left')
    table.add_column('Game')
    for s in ICON:
        table.add_column(s.capitalize(), justify='right', style=COLOR[s])
    games = {}
    for st in stations:
        games.setdefault(st['game'], {s: 0 for s in ICON})[states[st['id']]] += 1
    for game, c in games.items():
        table.add_row(game, *(str(n) if n else '[dim]0' for n in c.values()))
    console.print()
    console.print(table)

    count = write_report(stations, results, states, elapsed)
    console.print(f"\n[bold]{count[STATION_OK]}/{len(stations)} OK[/], [yellow]{count[STATION_WARNING]} warnings[/], "
                  f"[red]{count[STATION_ERROR]} errors[/], [magenta]{count[STATION_UNVERIFIED]} unverified[/] [dim]({elapsed:.0f}s)[/]")
    console.print(f'[dim]Report saved to {REPORT.relative_to(ROOT)}[/]')
    if count[STATION_ERROR]:
        sys.exit(1)
    if count[STATION_UNVERIFIED]:
        sys.exit(2)
    sys.exit(3 if count[STATION_WARNING] else 0)


if __name__ == '__main__':
    main()
