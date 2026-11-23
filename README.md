# Rádio Wheel — GTA VI & GTA V

Seletor de rádios no estilo da roda do jogo. Você não escolhe a música: cada estação está sempre "no ar" e você entra no ponto em que a programação está agora (a posição é calculada a partir do relógio, igual para todo mundo). Trocar de estação toca o chiado de sintonia.

- 15 estações do GTA VI e 17 do GTA V, com logos oficiais.
- Mostra a música que está tocando, a partir da tracklist com timestamps da descrição de cada vídeo.
- Áudio vem das transmissões completas publicadas no YouTube (player oculto).
- Controles: clique, setas do teclado, rodinha do mouse, arrastar o dedo em volta da roda; `Espaço` desliga.
- 6 memórias como no rádio do carro: toque para sintonizar, segure para salvar a rádio atual (teclas `1`–`6` também sintonizam).

## Rodar

```bash
python3 -m http.server 5173
```

Abra http://localhost:5173 (precisa ser via http, não `file://`, por causa do player do YouTube).

## Arquivos

- `stations.js` — estações (vídeo, duração, logo, cores).
- `tracks.js` — tracklists geradas por `tools/build_tracks.py` (rode de novo ao trocar vídeos).
- `logos/` — logos das estações (GTA Wiki).

## Próximos passos

- App mobile (Android + iOS) com Android Auto e Apple CarPlay.
