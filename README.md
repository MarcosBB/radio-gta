# Radio Wheel

A radio picker in the style of the Grand Theft Auto radio wheel. You don't pick the song: every station is always "on air" and you join it at the point its programme is at right now. The position comes from the clock, so it is the same for everyone. Switching stations plays the tuning static.

**🎧 Listen now: https://radio-wheel.marcosbb.com/**

> **Fan project, non-profit, not affiliated with Rockstar Games or Take-Two Interactive.**
> No audio is hosted here: the stations play through the official YouTube player, from public videos.
> Grand Theft Auto and the station names and logos are trademarks of their respective owners.
> If you own any of this content and want it removed, open an issue.

## Features

- 109 stations from GTA VI, V, IV, Vice City Stories, Liberty City Stories, San Andreas, Vice City and III.
- "Live" radio synced to the clock, with tuning static when switching.
- A wheel you drag to tune: on phones only part of it is on screen, like a dial; on desktop it takes most of the window.
- The name of the song playing now (from the timestamped tracklist of each video), with title and artist from Spotify.
- Spotify button: opens the current song straight on Spotify (or a search when the song was not matched).
- Two videos per station: if the first one fails, the site switches to the fallback.
- Favorite stations, marked with a star on the wheel.
- 6 presets like a car radio: tap to tune, hold to save.
- YouTube player in the panel: small by default, can be expanded or hidden.
- On phones, the control panel is a bottom sheet: collapsed it shows only the controls, pulled up it shows presets, game selector and player.
- Keyboard: arrows turn the wheel, `1`–`6` recall presets, `Space` turns the radio on and off.
- 8 languages: Portuguese (Brazil), English, Spanish, French, Chinese, Hindi, Arabic and Russian, each at its own URL (`/`, `/en/`, `/es/`, …).
- Installable as an app (PWA).

## Running

```bash
npm install
npm run dev -- --host   # http://localhost:5173, or the LAN IP on a phone
npm run build && npm run preview
```

Enable the pre-commit check once per clone:

```bash
git config core.hooksPath .githooks
```

## Structure

React 19 + Vite, Tailwind CSS v4 and Motion. See `CLAUDE.md` for the architecture and conventions.

- `contents/` — the data, as JSON: games, stations, genres (translated), tracklists and songs.
- `public/logos/` — station and game logos.
- `src/` — the app (`pages/Radio/` and its sections, shared `components/`, `hooks/`, `services/contentService.js`).
- `src/locales/` — UI strings, one file per language.
- `tools/` — data tooling: `check_videos.py`, `build_tracks.py`, `build_spotify.py`, `find_fallback_videos.py`.
- `stations-report.md` — stations that are missing and why.

## License

The original source code of this project is under the MIT license (see `LICENSE`).

The license does **not** cover third-party material, which belongs to its owners (including Rockstar Games and Take-Two Interactive):

- the station and game logos in `public/logos/`;
- the names "Grand Theft Auto", "GTA" and the station names;
- the songs and videos, which play through the YouTube player and are not hosted here.

This material is used in a non-profit fan project, without affiliation or endorsement. Anyone reusing the code should replace the logos or get permission from the owners.
