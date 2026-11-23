// Estações: id do vídeo "full radio station" no YouTube + duração (segundos).
// A duração é usada para calcular a posição "ao vivo" sem esperar o player carregar.
const d = (s) => s.split(':').reduce((a, n) => a * 60 + Number(n), 0);

window.STATIONS = {
  gta6: [
    { name: 'Vice City FM', logo: 'logos/vice-city-fm.png', short: 'VICE\nCITY',           genre: "Pop & New Wave dos anos 80", id: 'ZF_ae0Nyb5A', dur: d('6:08:56'), c: ['#ff3d8b', '#ffb03a'] },
    { name: 'Flash FM', logo: 'logos/flash-fm.png', short: 'FLASH',               genre: 'Pop, R&B & Dance',          id: '153QBwfwKLU', dur: d('2:14:48'), c: ['#ffe14d', '#ff5a1f'] },
    { name: 'Emotion 98.3', logo: 'logos/emotion-983.png', short: 'EMO\n98.3',           genre: 'Soft rock & baladas',       id: 'Hr4UgN6UbSw', dur: d('3:02:41'), c: ['#f06bd8', '#7b5cff'] },
    { name: 'V-Rock', logo: 'logos/v-rock.png', short: 'V-ROCK',                 genre: 'Rock clássico',             id: '-RwK09PE-lw', dur: d('5:20:36'), c: ['#e8e8e8', '#d11f2a'] },
    { name: 'VCRR', logo: 'logos/vcrr.png', short: 'VCRR',                   genre: 'Vice City Rock Radio',      id: 'LxdLqlBJIV0', dur: d('4:28:27'), c: ['#ff7a1a', '#2b2b2b'] },
    { name: 'Cocoteo FM', logo: 'logos/cocoteo-fm.png', short: 'COCO\nTEO',             genre: 'Reggaeton & Latin',         id: '0VweYz7fELs', dur: d('1:34:26'), c: ['#2bd9a5', '#ffde59'] },
    { name: 'Radio La Ola', logo: 'logos/radio-la-ola.png', short: 'LA\nOLA',           genre: 'Latina',                    id: 'GqLYAUj9Gco', dur: d('2:10:52'), c: ['#1fb6ff', '#ff4d6d'] },
    { name: 'Dirty South Classics', logo: 'logos/dirty-south-classics.png', short: 'DIRTY\nSOUTH',   genre: 'Southern hip-hop',          id: '6x0mbfqxkJU', dur: d('2:47:56'), c: ['#b4ff39', '#6b2bd9'] },
    { name: 'Back Country Radio', logo: 'logos/back-country-radio.png', short: 'BACK\nCNTRY',     genre: 'Country',                   id: 'zraN7Fv0GJM', dur: d('1:23:05'), c: ['#d9a35a', '#5a3a1f'] },
    { name: 'Circoloco Records', logo: 'logos/circoloco-records-radio.png', short: 'CIRCO\nLOCO',      genre: 'House & techno',            id: 'Kvarw9q9Zh4', dur: d('1:47:24'), c: ['#ffffff', '#111111'] },
    { name: 'Stockyard FM', logo: 'logos/stockyard-fm.png', short: 'STOCK\nYARD',           genre: 'Indie dance & eletrônica',  id: 'oM2hqeESZ3s', dur: d('2:05:08'), c: ['#ff9ec7', '#3a2bd9'] },
    { name: 'The Chamber 106.6', logo: 'logos/the-chamber-1066.png', short: 'CHMBR\n106.6',      genre: 'Metal',                     id: 'CGDc8K1IrIk', dur: d('1:46:31'), c: ['#9a9a9a', '#3d0000'] },
    { name: 'Radio On-U', logo: 'logos/radio-on-u.png', short: 'ON-U',             genre: 'Reggae & dub',              id: 'eyJhHrQ_tVI', dur: d('59:48'),   c: ['#2ecc40', '#ffdc00'] },
    { name: 'The Wipe', logo: 'logos/the-wipe.png', short: 'WIPE',               genre: 'Hip-hop',                   id: 'k3dThJPb15c', dur: d('1:05:58'), c: ['#00e5ff', '#ff2bd6'] },
    { name: 'WorldWide FM', logo: 'logos/worldwide-fm.png', short: 'WORLD\nWIDE',           genre: 'Gilles Peterson',           id: 'jsJOI56-FhY', dur: d('1:58:00'), c: ['#f5f5f5', '#ff6a00'] },
  ],
  gta5: [
    { name: 'Non-Stop-Pop FM', logo: 'logos/gta5-nonstop.svg', short: 'NON\nSTOP',        genre: 'Pop & dance',               id: 'lxr8moPqn74', dur: d('2:46:46'), c: ['#ff4fa3', '#ffd23f'] },
    { name: 'Los Santos Rock Radio', logo: 'logos/gta5-lsrr.svg', short: 'LS\nROCK',  genre: 'Rock clássico',             id: 'SUVpIy7nr6c', dur: d('2:35:23'), c: ['#ff6b1a', '#1a1a1a'] },
    { name: 'Radio Los Santos', logo: 'logos/gta5-rls.svg', short: 'RADIO\nLS',       genre: 'Hip-hop moderno',           id: 'UulQJTQG5AU', dur: d('1:51:32'), c: ['#ffd700', '#111111'] },
    { name: 'West Coast Classics', logo: 'logos/gta5-wcc.svg', short: 'WC\nCLSCS',    genre: 'Hip-hop clássico',          id: 'Njo2bg10Npc', dur: d('3:04:07'), c: ['#e23b3b', '#1f3fbf'] },
    { name: 'Channel X', logo: 'logos/gta5-chx.svg', short: 'CH X',              genre: 'Punk',                      id: 'AI9lEoEl7Yw', dur: d('47:08'), c: ['#ffffff', '#e0001b'] },
    { name: 'Rebel Radio', logo: 'logos/gta5-rebel.svg', short: 'REBEL',            genre: 'Country clássico',          id: '-JPol5USdz0', dur: d('57:38'), c: ['#c8a165', '#5b2a12'] },
    { name: 'Soulwax FM', logo: 'logos/gta5-soulwax.svg', short: 'SOUL\nWAX',             genre: 'Eletrônica',                id: 'Ed02_acbI2o', dur: d('42:47'),   c: ['#ffffff', '#000000'] },
    { name: 'East Los FM', logo: 'logos/gta5-eastlos.svg', short: 'EAST\nLOS',            genre: 'Música mexicana',           id: 'FGxPtCVSUDo', dur: d('41:06'),   c: ['#2bbf5a', '#e8312f'] },
    { name: 'Blue Ark', logo: 'logos/gta5-blueark.svg', short: 'BLUE\nARK',               genre: 'Reggae & dancehall',        id: 'cyALuo0_aRg', dur: d('1:19:51'), c: ['#1f9bff', '#0b2a66'] },
    { name: 'FlyLo FM', logo: 'logos/gta5-flylo.svg', short: 'FLYLO',               genre: 'IDM & hip-hop alternativo', id: '5j51XYTN4Q8', dur: d('1:11:39'), c: ['#ff3d3d', '#ffd23f'] },
    { name: 'The Lowdown 91.1', logo: 'logos/gta5-lowdown.svg', short: 'LOW\n91.1',       genre: 'Soul & funk',               id: '3eiDjAIdsco', dur: d('1:12:53'), c: ['#ffb347', '#6b2d8f'] },
    { name: 'Radio Mirror Park', logo: 'logos/gta5-mirror.svg', short: 'MIRROR\nPARK',      genre: 'Indie & synthpop',          id: 'gXJCnLt1v44', dur: d('2:32:41'), c: ['#7ae0ff', '#ff7ad1'] },
    { name: 'Space 103.2', logo: 'logos/gta5-space.svg', short: 'SPACE\n103.2',            genre: 'Funk & boogie',             id: 'mTBcsx7H4SQ', dur: d('1:34:14'), c: ['#b45cff', '#ff4f9a'] },
    { name: 'Vinewood Boulevard', logo: 'logos/gta5-vinewood.svg', short: 'VINE\nWOOD',     genre: 'Garage rock',               id: 'xD47-I43zsg', dur: d('1:05:58'), c: ['#ffe066', '#c0392b'] },
    { name: 'blonded Los Santos', logo: 'logos/gta5-blonded.svg', short: 'blonded',     genre: 'Frank Ocean',               id: 'AiIVpr_Smyo', dur: d('1:42:20'), c: ['#f2f2f2', '#ff8a00'] },
    { name: 'LS Underground Radio', logo: 'logos/gta5-lsur.svg', short: 'LSUR',   genre: 'House & techno',            id: 'QQ5rIoXlqnc', dur: d('4:38:51'), c: ['#00ffa3', '#101010'] },
    { name: 'The Lab', logo: 'logos/gta5-lab.svg', short: 'THE\nLAB',                genre: 'Hip-hop & eletrônica',      id: 'ZOR6_EtRg5I', dur: d('57:36'),   c: ['#39ff14', '#0a3d0a'] },
  ],
};
