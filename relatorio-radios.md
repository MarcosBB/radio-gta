# Rádios que faltam no Rádio Wheel

Situação em 25/11/2026: o app tem **109 rádios** de 8 jogos.

Nos jogos que o app já cobre faltam **7 rádios**, todas deixadas de fora de propósito. Outras **9 rádios** estão no app, mas incompletas. Os jogos que ainda não estão no app ficam no fim, com o que existe deles no YouTube.

| Jogo | No app | Faltam |
|---|---|---|
| GTA VI | 22 | 3 |
| GTA V | 23 | 2 |
| GTA IV + EFLC | 19 | 2 |
| San Andreas | 11 | 0 |
| Vice City Stories | 7 | 0 (2 faladas de fora) |
| Liberty City Stories | 9 | 0 (2 faladas de fora) |
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

## No app, mas incompletas (9)

| Rádio | Jogo | O que falta | Motivo |
|---|---|---|---|
| iFruit Radio | GTA V | Nome da música tocando | Nenhum vídeo bom tem tracklist com tempos na descrição. |
| Kult FM 99.1 | GTA V | Nome da música tocando | Nenhum vídeo bom tem tracklist com tempos na descrição. |
| The Music Locker | GTA V | Nome da música tocando | Nenhum vídeo bom tem tracklist com tempos na descrição. |
| MOTOMAMI Los Santos | GTA V | Nome da música tocando | O único vídeo com tempos é uma playlist com 134 visualizações, não a rádio do jogo. |
| Rise FM | Liberty City Stories | Nome da música tocando | Nenhum vídeo encontrado tem tracklist com tempos. |
| The Liberty Jam | Liberty City Stories | Nome da música tocando | Nenhum vídeo encontrado tem tracklist com tempos. |
| V-Rock | Vice City Stories | Nome da música tocando | Nenhum vídeo encontrado tem tracklist com tempos. |
| Wave 103 | Vice City Stories | Nome da música tocando | Nenhum vídeo encontrado tem tracklist com tempos. |
| The Vault Radio | GTA VI | Nome da música e logo | O vídeo não tem tempos e é uma remontagem de fã, na ordem das músicas do jogo. A gta.wiki não tem logo dela, então aparece o nome em texto. |

**Dá para resolver:** escrever as tracklists com tempos à mão, a partir das listas da wiki e ouvindo os vídeos, e colocar no `tracks.js`. Isso exige uma entrada manual que o `tools/build_tracks.py` não apague ao rodar de novo.

## Jogos adicionados em 25/11/2026

### Liberty City Stories

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

As faladas ficaram de fora: Liberty City Free Radio (LCFR) e Liberty News. Sem o nome da música tocando: Rise FM e The Liberty Jam.

### Vice City Stories

Usa os nomes das rádios do Vice City, mas com outras músicas, porque se passa em 1984. Todos os vídeos podem tocar embutidos.

| Rádio | Vídeo | Duração | Tracklist com tempos |
|---|---|---|---|
| Flash FM | `lcktJMlVx1I` | 1:04:50 | sim |
| V-Rock | `L0ejZEUwSeg` | 59:40 | não |
| Paradise FM | `zHWQii6yE-w` | 41:17 | sim |
| Wave 103 | `NDnVROj95lM` | 1:00:00 | não |
| Fresh 105 FM | `Zx7xfaa4agM` | 29:44 | sim |
| Radio Espantoso | `DIJ_3iN_Uzg` | 30:32 | sim |
| Emotion 98.3 | `nlwauathOI0` | 1:09:07 | sim |

As faladas ficaram de fora: VCPR e VCFL. Sem o nome da música tocando: V-Rock e Wave 103.

## Jogos que ainda não estão no app

Pesquisa no YouTube em 25/11/2026: para cada rádio, procurei um vídeo da estação completa e conferi se ele pode tocar embutido no site, que é o que o app usa. A lista de rádios de cada jogo foi conferida na gta.wiki.

| Jogo | Rádios musicais | No YouTube | Duração por rádio | Vale adicionar? |
|---|---|---|---|---|
| GTA 2 (1999) | 11 | 11 de 11 | 12 min (Head Radio: 24) | Talvez. Todas existem, mas são curtas e repetem logo. |
| GTA (1997) | 7 | 7 de 7 | 3–11 min | Não. São curtas demais para tocar como rádio ao vivo. |
| GTA London 1969/1961 | 9 | 9 de 9 | 2–7 min | Não. São curtas demais para tocar como rádio ao vivo. |
| GTA Chinatown Wars (2009) | — | — | — | Não. O jogo não tem rádio de verdade. |

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
