"""Rebuild contents/tracklists.json (and new entries of contents/songs.json) from the video descriptions.

Usage: python3 tools/build_tracks.py            (from the project root)
       python3 tools/build_tracks.py --missing  (only videos that have no tracklist yet)

Reads every video of contents/stations.json (primary and fallback) through the YouTube Data API
(YOUTUBE_API_KEY in .env) and parses the timestamps in its description. Existing songs keep their
Spotify data; songs no tracklist uses any more are removed.
"""
import argparse, sys
from common import env, new_song, parse_tracklist, read_json, slug, write_json, youtube_videos


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--missing', action='store_true', help='only fetch videos without a tracklist')
    args = ap.parse_args()
    key = env().get('YOUTUBE_API_KEY')
    if not key:
        sys.exit('YOUTUBE_API_KEY is missing in .env')

    stations = read_json('stations.json')
    old_lists = {t['id']: t for t in read_json('tracklists.json')}
    songs = read_json('songs.json')
    by_raw = {s['raw']: s for s in songs}
    used_ids = {s['id'] for s in songs}
    station_names = {s['name'].lower() for s in stations}
    talk_videos = {v['youtube_id'] for s in stations if 'talk' in s['genre'] for v in s['videos']}

    all_videos = [v['youtube_id'] for s in stations for v in s['videos']]
    fetch = [v for v in all_videos if not (args.missing and old_lists.get(v, {}).get('tracks'))]
    items = youtube_videos(fetch, key, parts='snippet')

    lists = []
    for vid in dict.fromkeys(all_videos):
        if vid not in items:
            lists.append(old_lists.get(vid, {'id': vid, 'tracks': []}))
            continue
        tracks = []
        for start, raw in parse_tracklist(items[vid]['snippet'].get('description', '')):
            raw = raw.strip()
            if raw not in by_raw:
                base = slug(raw)[:80].strip('-') or 'song'
                song_id, n = base, 2
                while song_id in used_ids:
                    song_id, n = f'{base}-{n}', n + 1
                used_ids.add(song_id)
                by_raw[raw] = new_song(raw, song_id, talk=vid in talk_videos, station_names=station_names)
            tracks.append({'start': start, 'song': by_raw[raw]['id']})
        lists.append({'id': vid, 'tracks': tracks})
        print(f'{vid}: {len(tracks)} tracks')

    referenced = {t['song'] for tl in lists for t in tl['tracks']}
    write_json('tracklists.json', lists)
    write_json('songs.json', [s for s in by_raw.values() if s['id'] in referenced])
    print(f'{len(lists)} tracklists, {len(referenced)} songs')


if __name__ == '__main__':
    main()
