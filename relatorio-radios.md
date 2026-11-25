# Rádios que faltam no Rádio Wheel

Situação em 25/11/2026: o app tem **93 rádios** de 6 jogos.

Nos jogos que o app já cobre faltam **7 rádios**, todas deixadas de fora de propósito. Outras **5 rádios** estão no app, mas incompletas. Os jogos que ainda não estão no app ficam no fim.

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

| Jogo | Rádios | Observação |
|---|---|---|
| Liberty City Stories (2005) | Head Radio, Double Clef FM, K-Jah, Rise FM, Lips 106, Radio Del Mundo, MSX 98, Flashback FM, The Liberty Jam, LCFR (falada) | 10 rádios (9 musicais). Seria o próximo jogo mais fácil de adicionar. |
| Vice City Stories (2006) | Flash FM, V-Rock, Paradise FM, Fresh 105 FM, Emotion 98.3, Wave 103, Radio Espantoso, VCFL (falada), VCPR (falada) | 9 rádios (7 musicais). |
| GTA (1997), GTA London (1999), GTA 2 (1999) | Várias rádios curtas por jogo | Poucas faixas cada. Rende pouco no formato "ao vivo". |
| GTA Chinatown Wars (2009) | — | Não tem rádio de verdade, só faixas instrumentais. |

Escrevi as listas de LCS e VCS de memória e não as conferi numa fonte. Antes de adicionar esses jogos, vale confirmar na gta.wiki.

---

## Fontes
- [Radio Stations in GTA VI — GTA Wiki](https://gta.wiki/w/Radio_Stations_in_GTA_VI)
- [GTA 6 Radio Songs List — Vice](https://www.vice.com/en/article/gta-6-radio-songs-list/)
- [GTA 5 Radio Stations — GTABase](https://www.gtabase.com/grand-theft-auto-v/soundtrack-radio-stations/)
- [Radio stations — FiveM docs](https://docs.fivem.net/docs/game-references/radiostations/)
