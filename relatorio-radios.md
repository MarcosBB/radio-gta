# Rádios que faltam no Rádio Wheel

Situação em 25/11/2026: o app tem **93 rádios** de 6 jogos.

Nos jogos que o app já cobre faltam **7 rádios**, todas deixadas de fora de propósito. Outras **5 rádios** estão no app, mas incompletas. Os jogos que ainda não estão no app ficam no fim, com o que existe deles no YouTube.

| Jogo | No app | Faltam |
|---|---|---|
| GTA VI | 22 | 3 |
| GTA V | 23 | 2 |
| GTA IV + EFLC | 19 | 2 |
| San Andreas | 11 | 0 |
| Vice City | 9 | 0 |
| GTA III | 9 | 0 |

---

## Faltando nos jogos do app (7)

| Rádio | Jogo | Tipo | Motivo |
|---|---|---|---|
| WKTT Talk Radio | GTA VI | Falada | Rádios faladas ficaram de fora por decisão. |
| WCTR (West Coast Talk Radio) | GTA V | Falada | Rádios faladas ficaram de fora por decisão. |
| Blaine County Talk Radio | GTA V | Falada | Rádios faladas ficaram de fora por decisão. |
| PLR (Public Liberty Radio) | GTA IV | Falada | Rádios faladas ficaram de fora por decisão. |
| Integrity 2.0 | GTA IV | Falada | Rádios faladas ficaram de fora por decisão. |
| The Sniper of La Perle | GTA VI | Musical (desbloqueável) | Não há vídeo bom. O único que achei é um mix de fã de 40 min, com menos de 100 visualizações. |
| Thrillbilly Mud Club Radio | GTA VI | Musical (só perto do clube) | Quase só repete músicas da The Chamber 106.6, que já está no app. Tem só duas faixas próprias. |

## No app, mas incompletas (5)

| Rádio | Jogo | O que falta | Motivo |
|---|---|---|---|
| iFruit Radio | GTA V | Nome da música tocando | Nenhum vídeo bom tem tracklist com tempos na descrição. |
| Kult FM 99.1 | GTA V | Nome da música tocando | Nenhum vídeo bom tem tracklist com tempos na descrição. |
| The Music Locker | GTA V | Nome da música tocando | Nenhum vídeo bom tem tracklist com tempos na descrição. |
| MOTOMAMI Los Santos | GTA V | Nome da música tocando | O único vídeo com tempos é uma playlist com 134 visualizações, não a rádio do jogo. |
| The Vault Radio | GTA VI | Nome da música e logo | O vídeo não tem tempos e é uma remontagem de fã, na ordem das músicas do jogo. A gta.wiki não tem logo dela, então aparece o nome em texto. |

**Dá para resolver:** escrever as tracklists com tempos à mão, a partir das listas da wiki e ouvindo os vídeos, e colocar no `tracks.js`. Isso exige uma entrada manual que o `tools/build_tracks.py` não apague ao rodar de novo.

## Jogos que ainda não estão no app

Pesquisa no YouTube em 25/11/2026: para cada rádio, procurei um vídeo da estação completa e conferi se ele pode tocar embutido no site, que é o que o app usa. A lista de rádios de cada jogo foi conferida na gta.wiki.

| Jogo | Rádios musicais | No YouTube | Duração por rádio | Vale adicionar? |
|---|---|---|---|---|
| Liberty City Stories (2005) | 9 | 9 de 9 | 26–48 min | **Sim** |
| Vice City Stories (2006) | 7 | 7 de 7 | 30–69 min | **Sim** |
| GTA 2 (1999) | 11 | 11 de 11 | 12 min (Head Radio: 24) | Talvez. Todas existem, mas são curtas e repetem logo. |
| GTA (1997) | 7 | 7 de 7 | 3–11 min | Não. São curtas demais para tocar como rádio ao vivo. |
| GTA London 1969/1961 | 9 | 9 de 9 | 2–7 min | Não. São curtas demais para tocar como rádio ao vivo. |
| GTA Chinatown Wars (2009) | — | — | — | Não. O jogo não tem rádio de verdade. |

### Liberty City Stories: as 9 rádios têm vídeo

Usa os nomes das rádios do GTA III, mas com outras músicas. Todos os vídeos podem tocar embutidos.

| Rádio | Vídeo | Duração | Tracklist com tempos |
|---|---|---|---|
| Head Radio | `birGWVDfQ74` | 26:37 | sim |
| Double Clef FM | `4ArVN_C6ac8` | 26:33 | sim |
| K-Jah | `95OGLvqstGI` | 28:48 | sim |
| Rise FM | `QmtD4z6Oo2Y` | 42:19 | não |
| Lips 106 | `M2Xw4fXTL0c` | 27:59 | sim |
| Radio Del Mundo | `_CgRA14tgwI` | 33:36 | sim |
| MSX 98 | `PQiuB-0gSv4` | 38:47 | sim |
| Flashback FM | `HaLOIiZBAlg` | 28:57 | sim |
| The Liberty Jam | `ClnjMBaFUKE` | 47:43 | não |

Ficariam de fora as faladas: Liberty City Free Radio (LCFR) e Liberty News.

### Vice City Stories: as 7 rádios têm vídeo

Usa os nomes das rádios do Vice City, mas com outras músicas, porque se passa em 1984. Todos os vídeos podem tocar embutidos.

| Rádio | Vídeo | Duração | Tracklist com tempos |
|---|---|---|---|
| Flash FM | `lcktJMlVx1I` | 1:04:50 | sim |
| V-Rock | `L0ejZEUwSeg` | 59:40 | não |
| Paradise FM | `zHWQii6yE-w` | 41:17 | sim |
| Wave 103 | `NDnVROj95lM` | 1:00:00 | não |
| Fresh 105 FM | `ox3ktu9mbdo` | 29:45 | sim (capítulos) |
| Radio Espantoso | `DIJ_3iN_Uzg` | 30:32 | sim |
| Emotion 98.3 | `nlwauathOI0` | 1:09:07 | sim |

Ficariam de fora as faladas: VCPR e VCFL.

### GTA 2, GTA 1 e London: têm vídeo, mas são curtas

- **GTA 2:** Head Radio, Rockstar Radio, KREZ, Lo-Fi FM, Futuro FM, Funami FM, Lithium FM, King 130.7, Osmosis FM, Heavenly Radio e KGBH. Todas têm vídeo completo de uns 12 min (a Head Radio tem 24).
- **GTA (1997):** Head Radio, N-CT FM, Radio '76 FM, The Fix FM, It's Unleashed FM, The Fergus Buckner Show FM e Brooklyn Underground FM. Cada vídeo tem de 3 a 11 min.
- **GTA London 1969/1961:** Heavy Heavy Monster Sound, Blow Up Radio, Kaleidoscope, Sound of Soho, Radio Penelope, Radio Andorra, Westminster Wireless, Radio 7 e Bush Sounds. Cada vídeo tem de 2 a 7 min.

Nesses três jogos não conferi se os vídeos podem tocar embutidos. Se o GTA 2 for entrar, isso precisa ser conferido antes.

---

## Fontes
- [Radio Stations in GTA VI — GTA Wiki](https://gta.wiki/w/Radio_Stations_in_GTA_VI)
- [GTA 6 Radio Songs List — Vice](https://www.vice.com/en/article/gta-6-radio-songs-list/)
- [GTA 5 Radio Stations — GTABase](https://www.gtabase.com/grand-theft-auto-v/soundtrack-radio-stations/)
- [Radio stations — FiveM docs](https://docs.fivem.net/docs/game-references/radiostations/)
