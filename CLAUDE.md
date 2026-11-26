# Radio Wheel

A GTA-style radio wheel for the web: every station is always "live" (the position comes from the clock, the same for everyone), audio plays through the official YouTube player, and tuning plays a static noise. Live at https://radio-wheel.marcosbb.com/ (GitHub Pages).

## Architecture

React 19 + Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), tailwind-variants, Motion (`motion`, imported from `motion/react`), react-i18next, vite-plugin-pwa.

**JavaScript only — never TypeScript.** Components are `.jsx`, everything else `.js`. No `.ts`/`.tsx` files, no `tsconfig.json`, no type packages beyond the `@types/react*` used by the editor.

The site is a single screen, so there is no router. Each language is a separate static entry (`/`, `/en/`, `/es/`, …) generated at build time; see Internationalization.

### Folder structure

```
contents/                        # JSON content files (the "database")
public/                          # served verbatim at the site root
  logos/                         # station logos
  logos/games/                   # game logos
  sounds/                        # tuning static
  CNAME, robots.txt, sitemap.xml, og.jpg, icons
scripts/check_content_assets.py  # pre-commit: every asset referenced in contents/ exists, every station has 2 videos with a tracklist
tools/                           # data tooling (Python): build_tracks.py, build_spotify.py, check_videos.py
.githooks/pre-commit
.github/workflows/deploy.yml     # builds and publishes dist/ to GitHub Pages
src/
  main.jsx                       # React entry
  App.jsx                        # renders the Radio page
  App.css                        # @theme design tokens
  index.css                      # global styles, font imports
  assets/icons/                  # fixed UI icons (power, arrows, star, spotify, volume) — imported
  config.js                      # fixed UI constants (preset count, hold-to-save ms, languages)
  locales/<lang>.json            # UI strings, one file per language; en.json is the source
  i18n.js                        # i18next setup and language detection
  hooks/                         # useLivePosition, useYouTubePlayer, useTuningStatic, useLocalStorage, useFavorites, usePresets, useMediaQuery, useMediaSession
  components/                    # components used by more than one section (StationLogo, IconButton, Star, Toast)
  pages/
    Radio/
      index.jsx                  # composes the page from its sections
      sections/
        header/
        wheel/                   # index.jsx + WheelSlot.jsx, WheelCenter.jsx
        controlPanel/            # mobile bottom sheet / desktop panel: transport, volume, spotify
        gameSelector/            # index.jsx + GameCoversDialog.jsx
        presets/
        player/                  # YouTube iframe (mini / expanded / hidden)
  services/contentService.js     # the only data layer
  utils/                         # pure helpers (time parsing, live position, angle math)
```

### Componentization (mandatory)

Every page **must** be split into components — never a single large page file.

- A page's `index.jsx` only composes its sections; it holds no markup of its own beyond layout glue.
- Each section is `src/pages/<PageName>/sections/<sectionName>/index.jsx` (PascalCase page folder, camelCase section folder). Components used only by that section live beside it in the same folder.
- A component used by more than one section goes in `src/components/`. When a section-local component starts being reused elsewhere, move it there.
- Components never read JSON directly; they get data from `contentService.js` (or via props from the page).
- Player state that several sections share (current game, current station, power, volume) lives in one React context in `src/pages/Radio/`, not in globals.

**Path alias:** `@` maps to `src/` (`vite.config.js` and `jsconfig.json`).

### Media placement

- **Content media** — anything that belongs to the station data and may be swapped (station and game logos, the tuning sound, the OG image): `public/`. Referenced from JSON by their path relative to `public/`.
- **Non-customizable media** — UI chrome that belongs to the design (icons, decorative shapes): `src/assets/`, imported in the component so Vite hashes them.

### Things that must not break

- The YouTube iframe is mounted once and never unmounted (collapsing the bottom sheet, hiding the video or switching stations must not remount it, or playback stops).
- The live position is `(now / 1000) % duration` of the video that is actually playing, primary or fallback.
- Presets, favorites and the last station per game are stored by station `id` in `localStorage`. Never store array indexes.
- The site name "Radio Wheel" is never translated; it is not in the locale files.

## Code conventions

Comments are written in **English**, and only when strictly necessary — when the code cannot express *why* something is done. Do not comment *what* the code already says.

**Everything in the repository is in English:** code (identifiers, file and folder names, comments, commit messages), docs (`README.md`, reports) and all content in `contents/`. The only non-English text is the translations: `src/locales/<lang>.json` and the per-language `name` objects in `contents/genres.json`.

ESLint enforces no semicolons and 2-space indentation.

### Commits

One line, in English, no body: `<type>: <what changed>` — `feat:`, `fix:`, `docs:`, `chore:`.

Never add a `Co-Authored-By` trailer, or any other tool/attribution footer.

Never commit and never `git push` unless the user explicitly asks for it. Never merge into `main` or deploy unless the user asks.

## Content layer

Only station data goes in `contents/`. Fixed UI — labels, button texts, the number of presets — is hardcoded in components and `config.js`; UI strings come from `src/locales/`.

Content is a set of JSON files in `contents/` — there is no database. `contentService.js` inlines `games.json`, `stations.json` and `genres.json` into the bundle with `import.meta.glob(..., { eager: true })`; `tracklists.json` and `songs.json` are large, so they are loaded with a dynamic `import()` when the radio is switched on. No runtime fetch, no env vars.

Logos live in `public/logos/` and are copied to `dist/` untouched, so the path stored in the JSON (`logos/...`) *is* the URL and `assetUrl()` only prefixes the base path.

### Content file structure

Each file in `contents/` is a JSON **array of objects**, one object per entry:

- Every entry has a unique string `id` (kebab-case, e.g. `"gta6-vice-city-fm"`), except `tracklists.json`, whose `id` is the YouTube video id.
- Files reference each other by `id` — never duplicate data. Id resolution happens inside `contentService.js`, never in components.
- Asset fields are named `logo` or `sound`. A value with a slash (`logos/flash-fm.png`) is a path relative to `public/`. `check_content_assets.py` validates them.
- Durations are `"h:mm:ss"` or `"m:ss"` strings; `contentService.js` converts them to seconds.
- Each file gets a `get<Name>Data()` function in `contentService.js` returning a view-ready shape (resolved ids, final URLs, durations in seconds, genre in the current language).

Adding a content type means: a JSON file in `contents/`, a `get*Data` function, and a section component. When a new content file is created, document its fields in the table below.

| File | Fields |
|------|--------|
| `games.json` | `id` (`gta6`, `gta5`, …), `label` (`GTA VI`), `mark` (`VI`), `full_name`, `place`, `year`, `colors` (`[c1, c2]`), `logo` (`logos/games/<id>.png`) — the games, in selector order |
| `stations.json` | `id` (`<game>-<slug>`), `game` (id into `games.json`), `name`, `short` (badge text when there is no logo; `\n` breaks the line), `logo` (optional, `logos/…`), `light` (bool: logo needs a light backdrop), `genre` (id into `genres.json`), `colors` (`[c1, c2]`, the theme while it plays), `videos` (exactly 2 objects `{ "youtube_id", "duration" }`; the first is the primary, the second the fallback used when the first fails) — the stations, in wheel order per game |
| `genres.json` | `id`, `name` (object keyed by language: `en`, `pt`, `es`, `fr`, `zh`, `hi`, `ar`, `ru`) |
| `tracklists.json` | `id` (YouTube video id), `tracks` (array of `{ "start" (seconds), "song" (id into `songs.json`) }`) — generated by `tools/build_tracks.py`, never edited by hand |
| `songs.json` | `id`, `raw` (the original tracklist line), `title`, `artist` (from Spotify when matched, otherwise split from `raw`), `spotify_id` (or `null`), `spotify_checked` (bool: set when fixed by hand, so `build_spotify.py` leaves the entry alone) |

`scripts/check_content_assets.py` fails when a JSON references a file that does not exist, a station does not have exactly 2 videos, or a video has no tracklist. It runs as a pre-commit hook from `.githooks/`, enabled once per clone with `git config core.hooksPath .githooks`.

## Data tooling

- `uv run tools/check_videos.py` — checks that both videos of every station still play embedded (removed, private, age-restricted, embedding blocked, blocked in Brazil, duration changed) and writes `video-report.md`. Uses `YOUTUBE_API_KEY` from `.env` when present.
- `python3 tools/build_tracks.py` — reads every video description and regenerates `tracklists.json` and the `raw`/`title`/`artist` of new songs in `songs.json`.
- `python3 tools/build_spotify.py` — fills `spotify_id`, `title` and `artist` from the Spotify Web API (client credentials, `SPOTIFY_CLIENT_ID`/`SPOTIFY_CLIENT_SECRET` in `.env`); low-confidence matches go to `spotify-report.md` for manual review. Resumable.
- `stations-report.md` lists the stations that are missing and why; update it whenever a station is added or removed.

`.env` is never committed.

## Internationalization

Languages: `en`, `pt` (Brazilian Portuguese, the default at `/`), `es`, `fr`, `zh` (Simplified Chinese), `hi`, `ar` (right-to-left), `ru`.

- UI strings live in `src/locales/<lang>.json`; `en.json` is the source and every key must exist in all files.
- Station names, game names and song titles are never translated. Genres are translated through `genres.json`.
- Arabic sets `dir="rtl"` on `<html>`; the header and panels mirror, the wheel does not.
- The build emits one `index.html` per language (`/<lang>/index.html`, Portuguese at `/`) with the translated `<title>`, description, `lang`, `dir`, canonical and hreflang links, and `sitemap.xml` lists them all. The legacy `?lang=en` redirects to `/en/`.

## Running

```bash
npm install
npm run dev -- --host   # open on a phone through the LAN IP
npm run build && npm run preview
```
