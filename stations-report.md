# Stations missing from Radio Wheel

As of 2026-11-25 the site has **109 stations** from 8 games.

The games the site already covers are missing **7 stations**, all left out on purpose. Another **9 stations** are on the site but incomplete. The games that are not on the site yet are at the end, with what YouTube has of them.

| Game | On the site | Missing |
|---|---|---|
| GTA VI | 22 | 3 |
| GTA V | 23 | 2 |
| GTA IV + EFLC | 19 | 2 |
| San Andreas | 11 | 0 |
| Vice City Stories | 7 | 0 (2 talk stations left out) |
| Liberty City Stories | 9 | 0 (2 talk stations left out) |
| Vice City | 9 | 0 |
| GTA III | 9 | 0 |

---

## Missing from the covered games (7)

| Station | Game | Kind | Reason |
|---|---|---|---|
| WKTT Talk Radio | GTA VI | Talk | Talk stations were left out by decision. |
| WCTR (West Coast Talk Radio) | GTA V | Talk | Talk stations were left out by decision. |
| Blaine County Talk Radio | GTA V | Talk | Talk stations were left out by decision. |
| PLR (Public Liberty Radio) | GTA IV | Talk | Talk stations were left out by decision. |
| Integrity 2.0 | GTA IV | Talk | Talk stations were left out by decision. |
| The Sniper of La Perle | GTA VI | Music (unlockable) | No good video. The only one found is a 40-minute fan mix with fewer than 100 views. |
| Thrillbilly Mud Club Radio | GTA VI | Music (only near the club) | It mostly repeats songs from The Chamber 106.6, which is already on the site. It has only two songs of its own. |

## On the site, but incomplete (9)

| Station | Game | What is missing | Reason |
|---|---|---|---|
| iFruit Radio | GTA V | Song playing now | No good video has a timestamped tracklist in its description. |
| Kult FM 99.1 | GTA V | Song playing now | No good video has a timestamped tracklist in its description. |
| The Music Locker | GTA V | Song playing now | No good video has a timestamped tracklist in its description. |
| MOTOMAMI Los Santos | GTA V | Song playing now | The only video with timestamps is a playlist with 134 views, not the in-game station. |
| Rise FM | Liberty City Stories | Song playing now | No video found has a timestamped tracklist. |
| The Liberty Jam | Liberty City Stories | Song playing now | No video found has a timestamped tracklist. |
| V-Rock | Vice City Stories | Song playing now | No video found has a timestamped tracklist. |
| Wave 103 | Vice City Stories | Song playing now | No video found has a timestamped tracklist. |
| The Vault Radio | GTA VI | Song playing now and logo | The video has no timestamps and is a fan re-edit in the game's song order. gta.wiki has no logo for it, so its name is shown as text. |

**Possible fix:** write timestamped tracklists by hand, from the wiki lists and by listening to the videos. That needs a manual entry that `tools/build_tracks.py` does not overwrite when it runs again.

## Fallback videos

Since 2026-11-26 every station has a second video that the site plays when the first one fails (`tools/find_fallback_videos.py`). **108 of 109** stations have one.

| Station | Game | Reason |
|---|---|---|
| Kult FM 99.1 | GTA V | No other full video of the station plays embedded. |

When a fallback video has a tracklist and the primary does not (iFruit Radio, Kult FM, The Music Locker, MOTOMAMI, Rise FM, The Liberty Jam, V-Rock, Wave 103), the song name only shows while the fallback is playing. Swapping primary and fallback in `contents/stations.json` would show it all the time; check that the fallback is the in-game station first.

## Games added on 2026-11-25

### Liberty City Stories

Uses the GTA III station names, with different songs. Every video plays embedded.

| Station | Video | Length | Timestamped tracklist |
|---|---|---|---|
| Head Radio | `birGWVDfQ74` | 26:37 | yes |
| Double Clef FM | `4ArVN_C6ac8` | 26:33 | yes |
| K-Jah | `95OGLvqstGI` | 28:48 | yes |
| Rise FM | `QmtD4z6Oo2Y` | 42:19 | no |
| Lips 106 | `M2Xw4fXTL0c` | 27:59 | yes |
| Radio Del Mundo | `_CgRA14tgwI` | 33:36 | yes |
| MSX 98 | `PQiuB-0gSv4` | 38:47 | yes |
| Flashback FM | `HaLOIiZBAlg` | 28:57 | yes |
| The Liberty Jam | `ClnjMBaFUKE` | 47:43 | no |

The talk stations were left out: Liberty City Free Radio (LCFR) and Liberty News. Without the song playing now: Rise FM and The Liberty Jam.

### Vice City Stories

Uses the Vice City station names, with different songs, because it is set in 1984. Every video plays embedded.

| Station | Video | Length | Timestamped tracklist |
|---|---|---|---|
| Flash FM | `lcktJMlVx1I` | 1:04:50 | yes |
| V-Rock | `L0ejZEUwSeg` | 59:40 | no |
| Paradise FM | `zHWQii6yE-w` | 41:17 | yes |
| Wave 103 | `NDnVROj95lM` | 1:00:00 | no |
| Fresh 105 FM | `Zx7xfaa4agM` | 29:44 | yes |
| Radio Espantoso | `DIJ_3iN_Uzg` | 30:32 | yes |
| Emotion 98.3 | `nlwauathOI0` | 1:09:07 | yes |

The talk stations were left out: VCPR and VCFL. Without the song playing now: V-Rock and Wave 103.

## Games not on the site yet

YouTube search on 2026-11-25: for each station, a video of the full station was searched for and checked to play embedded on the site, which is what the site uses. Each game's station list was checked on gta.wiki.

| Game | Music stations | On YouTube | Length per station | Worth adding? |
|---|---|---|---|---|
| GTA 2 (1999) | 11 | 11 of 11 | 12 min (Head Radio: 24) | Maybe. All exist, but they are short and repeat quickly. |
| GTA (1997) | 7 | 7 of 7 | 3–11 min | No. Too short to play as live radio. |
| GTA London 1969/1961 | 9 | 9 of 9 | 2–7 min | No. Too short to play as live radio. |
| GTA Chinatown Wars (2009) | — | — | — | No. The game has no real radio. |

### GTA 2, GTA 1 and London: on YouTube, but short

- **GTA 2:** Head Radio, Rockstar Radio, KREZ, Lo-Fi FM, Futuro FM, Funami FM, Lithium FM, King 130.7, Osmosis FM, Heavenly Radio and KGBH. All have a full video of about 12 min (Head Radio has 24).
- **GTA (1997):** Head Radio, N-CT FM, Radio '76 FM, The Fix FM, It's Unleashed FM, The Fergus Buckner Show FM and Brooklyn Underground FM. Each video is 3 to 11 min.
- **GTA London 1969/1961:** Heavy Heavy Monster Sound, Blow Up Radio, Kaleidoscope, Sound of Soho, Radio Penelope, Radio Andorra, Westminster Wireless, Radio 7 and Bush Sounds. Each video is 2 to 7 min.

For these three games it was not checked whether the videos play embedded. If GTA 2 is added, check that first.

---

## Sources
- [Radio Stations in GTA VI — GTA Wiki](https://gta.wiki/w/Radio_Stations_in_GTA_VI)
- [GTA 6 Radio Songs List — Vice](https://www.vice.com/en/article/gta-6-radio-songs-list/)
- [GTA 5 Radio Stations — GTABase](https://www.gtabase.com/grand-theft-auto-v/soundtrack-radio-stations/)
- [Radio stations — FiveM docs](https://docs.fivem.net/docs/game-references/radiostations/)
