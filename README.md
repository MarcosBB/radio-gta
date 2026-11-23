# Rádio Wheel

Seletor de rádios no estilo da roda dos jogos Grand Theft Auto. Você não escolhe a música: cada estação está sempre "no ar" e você entra no ponto em que a programação está agora — a posição é calculada pelo relógio, igual para todo mundo. Trocar de estação toca o chiado de sintonia.

> **Projeto de fã, sem fins lucrativos e sem afiliação com a Rockstar Games ou a Take-Two Interactive.**
> Nenhum áudio é hospedado aqui: as rádios tocam pelo player oficial do YouTube, a partir de vídeos públicos.
> Grand Theft Auto, nomes e logos das estações são marcas de seus respectivos donos.
> Se você é dono de algum conteúdo e quer que ele seja removido, abra uma issue.

## Recursos

- 80 estações de GTA VI, V, IV, San Andreas, Vice City e III.
- Rádio "ao vivo" sincronizada pelo relógio, com chiado de sintonia ao trocar.
- Nome da música tocando agora (a partir das tracklists com tempo de cada vídeo).
- Botão do Spotify: abre a música atual no Spotify para salvar nas Curtidas.
- 6 memórias como no rádio do carro: toque sintoniza, segure salva.
- Player do YouTube no rodapé do painel: miniatura por padrão, pode expandir ou ocultar o vídeo.
- Troca de jogo pelas setas ‹ ›, deslizando o dedo no nome ou pela grade de capas.
- Teclado: setas giram a roda, `1`–`6` chamam as memórias, `Espaço` liga/desliga.
- Responsivo (celular, tablet, desktop) e instalável como app (PWA).

## Rodar

```bash
python3 -m http.server 5173
```

Abra http://localhost:5173 (precisa ser via http, não `file://`, por causa do player do YouTube).

## Estrutura

- `index.html` — interface e lógica.
- `stations.js` — jogos e estações (vídeo, duração, logo, cores).
- `tracks.js` — tracklists, geradas por `tools/build_tracks.py` a partir das descrições dos vídeos.
- `logos/` — logos das estações.
- `logos/games/` — logos dos jogos.

## Licença

Código sob a licença MIT (veja `LICENSE`). A licença vale só para o código deste repositório, não para músicas, vídeos, marcas ou logos de terceiros.
