// Estações: id do vídeo "full radio station" no YouTube + duração (segundos).
// A duração é usada para calcular a posição "ao vivo" sem esperar o player carregar.
const d = (s) => s.split(':').reduce((a, n) => a * 60 + Number(n), 0);

window.STATIONS = {
  gta6: [
    { name: 'Vice City FM', short: 'VICE\nCITY',           genre: "Pop & New Wave dos anos 80", id: 'ZF_ae0Nyb5A', dur: d('6:08:56'), c: ['#ff3d8b', '#ffb03a'] },
    { name: 'Flash FM', short: 'FLASH',               genre: 'Pop, R&B & Dance',          id: 'XCODQReZk9I', dur: d('4:48:16'), c: ['#ffe14d', '#ff5a1f'] },
    { name: 'Emotion 98.3', short: 'EMO\n98.3',           genre: 'Soft rock & baladas',       id: 'Hr4UgN6UbSw', dur: d('3:02:41'), c: ['#f06bd8', '#7b5cff'] },
    { name: 'V-Rock', short: 'V-ROCK',                 genre: 'Rock clássico',             id: '-RwK09PE-lw', dur: d('5:20:36'), c: ['#e8e8e8', '#d11f2a'] },
    { name: 'VCRR', short: 'VCRR',                   genre: 'Vice City Rock Radio',      id: 'LxdLqlBJIV0', dur: d('4:28:27'), c: ['#ff7a1a', '#2b2b2b'] },
    { name: 'Cocoteo FM', short: 'COCO\nTEO',             genre: 'Reggaeton & Latin',         id: '0VweYz7fELs', dur: d('1:34:26'), c: ['#2bd9a5', '#ffde59'] },
    { name: 'Radio La Ola', short: 'LA\nOLA',           genre: 'Latina',                    id: 'GqLYAUj9Gco', dur: d('2:10:52'), c: ['#1fb6ff', '#ff4d6d'] },
    { name: 'Dirty South Classics', short: 'DIRTY\nSOUTH',   genre: 'Southern hip-hop',          id: '6x0mbfqxkJU', dur: d('2:47:56'), c: ['#b4ff39', '#6b2bd9'] },
    { name: 'Back Country Radio', short: 'BACK\nCNTRY',     genre: 'Country',                   id: 'zraN7Fv0GJM', dur: d('1:23:05'), c: ['#d9a35a', '#5a3a1f'] },
    { name: 'Circoloco Records', short: 'CIRCO\nLOCO',      genre: 'House & techno',            id: 'Kvarw9q9Zh4', dur: d('1:47:24'), c: ['#ffffff', '#111111'] },
    { name: 'Stockyard FM', short: 'STOCK\nYARD',           genre: 'Indie dance & eletrônica',  id: 'oM2hqeESZ3s', dur: d('2:05:08'), c: ['#ff9ec7', '#3a2bd9'] },
    { name: 'The Chamber 106.6', short: 'CHMBR\n106.6',      genre: 'Metal',                     id: 'CGDc8K1IrIk', dur: d('1:46:31'), c: ['#9a9a9a', '#3d0000'] },
    { name: 'Radio On-U', short: 'ON-U',             genre: 'Reggae & dub',              id: 'eyJhHrQ_tVI', dur: d('59:48'),   c: ['#2ecc40', '#ffdc00'] },
    { name: 'The Wipe', short: 'WIPE',               genre: 'Hip-hop',                   id: 'k3dThJPb15c', dur: d('1:05:58'), c: ['#00e5ff', '#ff2bd6'] },
    { name: 'WorldWide FM', short: 'WORLD\nWIDE',           genre: 'Gilles Peterson',           id: 'E12IJ0QQJfw', dur: d('1:57:37'), c: ['#f5f5f5', '#ff6a00'] },
  ],
  gta5: [
    { name: 'Non-Stop-Pop FM', short: 'NON\nSTOP',        genre: 'Pop & dance',               id: 'Fjp0wu3lEHk', dur: d('3:51:18'), c: ['#ff4fa3', '#ffd23f'] },
    { name: 'Los Santos Rock Radio', short: 'LS\nROCK',  genre: 'Rock clássico',             id: 'xhXAJD_Q8uU', dur: d('4:42:40'), c: ['#ff6b1a', '#1a1a1a'] },
    { name: 'Radio Los Santos', short: 'RADIO\nLS',       genre: 'Hip-hop moderno',           id: 'C3_FSXZtRe8', dur: d('5:56:25'), c: ['#ffd700', '#111111'] },
    { name: 'West Coast Classics', short: 'WC\nCLSCS',    genre: 'Hip-hop clássico',          id: 'z0Wf3IuZnf0', dur: d('4:18:33'), c: ['#e23b3b', '#1f3fbf'] },
    { name: 'Channel X', short: 'CH X',              genre: 'Punk',                      id: 'HHG44PJ0oyo', dur: d('1:31:50'), c: ['#ffffff', '#e0001b'] },
    { name: 'Rebel Radio', short: 'REBEL',            genre: 'Country clássico',          id: 'HeLsaX1I5B4', dur: d('1:22:39'), c: ['#c8a165', '#5b2a12'] },
    { name: 'Soulwax FM', short: 'SOUL\nWAX',             genre: 'Eletrônica',                id: 'EhsQZl8BFz8', dur: d('54:20'),   c: ['#ffffff', '#000000'] },
    { name: 'East Los FM', short: 'EAST\nLOS',            genre: 'Música mexicana',           id: 'xTpsoTmhdNc', dur: d('45:03'),   c: ['#2bbf5a', '#e8312f'] },
    { name: 'Blue Ark', short: 'BLUE\nARK',               genre: 'Reggae & dancehall',        id: 'LRdjhqMYSGg', dur: d('2:15:34'), c: ['#1f9bff', '#0b2a66'] },
    { name: 'FlyLo FM', short: 'FLYLO',               genre: 'IDM & hip-hop alternativo', id: '3P-ux63rHkU', dur: d('2:09:30'), c: ['#ff3d3d', '#ffd23f'] },
    { name: 'The Lowdown 91.1', short: 'LOW\n91.1',       genre: 'Soul & funk',               id: 'RT9h-C24idQ', dur: d('2:22:20'), c: ['#ffb347', '#6b2d8f'] },
    { name: 'Radio Mirror Park', short: 'MIRROR\nPARK',      genre: 'Indie & synthpop',          id: 'SDWHIACuuaQ', dur: d('3:32:54'), c: ['#7ae0ff', '#ff7ad1'] },
    { name: 'Space 103.2', short: 'SPACE\n103.2',            genre: 'Funk & boogie',             id: '6TnV43UWoqk', dur: d('3:08:19'), c: ['#b45cff', '#ff4f9a'] },
    { name: 'Vinewood Boulevard', short: 'VINE\nWOOD',     genre: 'Garage rock',               id: '5fnGyUc2eFs', dur: d('1:32:17'), c: ['#ffe066', '#c0392b'] },
    { name: 'blonded Los Santos', short: 'blonded',     genre: 'Frank Ocean',               id: '-tVumJBaTWY', dur: d('1:42:20'), c: ['#f2f2f2', '#ff8a00'] },
    { name: 'LS Underground Radio', short: 'LSUR',   genre: 'House & techno',            id: 'I2Xjuz-mnN0', dur: d('4:38:55'), c: ['#00ffa3', '#101010'] },
    { name: 'The Lab', short: 'THE\nLAB',                genre: 'Hip-hop & eletrônica',      id: 'Xy75nA56vcc', dur: d('57:37'),   c: ['#39ff14', '#0a3d0a'] },
  ],
};
