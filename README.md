# Rádio Wheel

Seletor de rádios no estilo da roda dos jogos Grand Theft Auto. Você não escolhe a música: cada estação está sempre "no ar" e você entra no ponto em que a programação está agora — a posição é calculada pelo relógio, igual para todo mundo. Trocar de estação toca o chiado de sintonia.

**🎧 Ouça agora: https://radio-wheel.marcosbb.com/**

> **Projeto de fã, sem fins lucrativos e sem afiliação com a Rockstar Games ou a Take-Two Interactive.**
> Nenhum áudio é hospedado aqui: as rádios tocam pelo player oficial do YouTube, a partir de vídeos públicos.
> Grand Theft Auto, nomes e logos das estações são marcas de seus respectivos donos.
> Se você é dono de algum conteúdo e quer que ele seja removido, abra uma issue.

## Recursos

- 93 estações de GTA VI, V, IV, San Andreas, Vice City e III.
- Rádio "ao vivo" sincronizada pelo relógio, com chiado de sintonia ao trocar.
- Nome da música tocando agora (a partir das tracklists com tempo de cada vídeo).
- Botão do Spotify: abre a música atual no Spotify para salvar nas Curtidas.
- 6 memórias como no rádio do carro: toque sintoniza, segure salva.
- Player do YouTube no rodapé do painel: miniatura por padrão, pode expandir ou ocultar o vídeo.
- Troca de jogo pelas setas ‹ ›, deslizando o dedo no nome ou pela grade de capas.
- Teclado: setas giram a roda, `1`–`6` chamam as memórias, `Espaço` liga/desliga.
- Responsivo (celular, tablet, desktop) e instalável como app (PWA).
- Português e inglês: detecta o idioma do navegador, botão PT/EN no canto e versão em inglês em `?lang=en`.

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
- `sitemap.xml` — sitemap com as versões em português e inglês (hreflang), para o Google.

## Licença

O código-fonte original deste projeto está sob a licença MIT (veja `LICENSE`).

A licença **não** cobre material de terceiros, que pertence aos respectivos donos (incluindo a Rockstar Games e a Take-Two Interactive):

- os logos das estações e dos jogos em `logos/` e `logos/games/`;
- os nomes "Grand Theft Auto", "GTA" e os nomes das estações;
- as músicas e os vídeos, que tocam pelo player do YouTube e não são hospedados aqui.

Esse material é usado num projeto de fã sem fins lucrativos, sem afiliação nem endosso. Quem quiser reaproveitar o código deve substituir os logos ou obter permissão dos donos.
