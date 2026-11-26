"""Pre-commit check of contents/: referenced files exist, ids resolve and every station is playable.

Fails (exit 1) when a JSON references a file missing from public/, an id points nowhere, a
station has no video, or a video has no tracklist entry. A station without its fallback video
is only a warning, so the commit goes through.
"""
import json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
C = ROOT / 'contents'
load = lambda name: json.loads((C / name).read_text())

errors, warnings = [], []
games, stations, genres = load('games.json'), load('stations.json'), load('genres.json')
tracklists, songs = load('tracklists.json'), load('songs.json')
game_ids, genre_ids = {g['id'] for g in games}, {g['id'] for g in genres}
lists, song_ids = {t['id']: t for t in tracklists}, {s['id'] for s in songs}

for name, entries in [('games.json', games), ('stations.json', stations), ('genres.json', genres), ('songs.json', songs)]:
    seen = set()
    for e in entries:
        if e['id'] in seen:
            errors.append(f"{name}: duplicate id {e['id']}")
        seen.add(e['id'])
        for field in ('logo', 'image', 'icon', 'sound', 'file'):
            path = e.get(field)
            if path and '/' in path and not (ROOT / 'public' / path).exists():
                errors.append(f"{name}: {e['id']}.{field} → public/{path} does not exist")

for st in stations:
    if st['game'] not in game_ids:
        errors.append(f"stations.json: {st['id']} has unknown game {st['game']}")
    if st['genre'] not in genre_ids:
        errors.append(f"stations.json: {st['id']} has unknown genre {st['genre']}")
    if not st['videos']:
        errors.append(f"stations.json: {st['id']} has no video")
    elif len(st['videos']) < 2:
        warnings.append(f"stations.json: {st['id']} has no fallback video")
    for v in st['videos']:
        if v['youtube_id'] not in lists:
            errors.append(f"tracklists.json: no entry for {v['youtube_id']} ({st['id']}); run tools/build_tracks.py")

for tl in tracklists:
    for t in tl['tracks']:
        if t['song'] not in song_ids:
            errors.append(f"tracklists.json: {tl['id']} references unknown song {t['song']}")

if warnings:
    print(f'warning: {len(warnings)} stations have no fallback video (tools/find_fallback_videos.py)')
for e in errors:
    print(f'error: {e}')
if errors:
    sys.exit(1)
print(f'contents OK ({len(stations)} stations, {len(warnings)} warnings)')
