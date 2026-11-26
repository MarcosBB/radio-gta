import { parseDuration } from '@/utils/live'

const files = import.meta.glob(['/contents/games.json', '/contents/stations.json', '/contents/genres.json'], { eager: true, import: 'default' })
const games = files['/contents/games.json']
const stations = files['/contents/stations.json']
const genres = Object.fromEntries(files['/contents/genres.json'].map((g) => [g.id, g.name]))

export const assetUrl = (path) => (path ? `/${path}` : null)

const stationView = (s, lang) => ({
  id: s.id,
  game: s.game,
  name: s.name,
  short: s.short || s.name.toUpperCase(),
  logo: assetUrl(s.logo),
  light: s.light,
  genre: genres[s.genre]?.[lang] || genres[s.genre]?.en || '',
  colors: s.colors,
  videos: s.videos.map((v) => ({ id: v.youtube_id, duration: parseDuration(v.duration) })),
})

export function getGamesData() {
  return games.map((g) => ({
    id: g.id,
    label: g.label,
    mark: g.mark,
    fullName: g.full_name,
    place: g.place,
    year: g.year,
    colors: g.colors,
    logo: assetUrl(g.logo),
    stationCount: stations.filter((s) => s.game === g.id).length,
    previewLogos: stations.filter((s) => s.game === g.id && s.logo).slice(0, 3).map((s) => ({ src: assetUrl(s.logo), light: s.light })),
  }))
}

export function getStationsData(gameId, lang) {
  return stations.filter((s) => s.game === gameId).map((s) => stationView(s, lang))
}

export function getStationById(id, lang) {
  const s = stations.find((x) => x.id === id)
  return s ? stationView(s, lang) : null
}

export function findStationId(gameId, name) {
  return stations.find((s) => s.game === gameId && s.name === name)?.id ?? null
}

export function stationIdsOf(gameId) {
  return stations.filter((s) => s.game === gameId).map((s) => s.id)
}

let songsPromise = null

// Tracklists and songs are large, so they are only loaded once the radio is on.
export function loadSongsData() {
  songsPromise ??= Promise.all([import('/contents/tracklists.json'), import('/contents/songs.json')]).then(([tl, sg]) => {
    const songs = Object.fromEntries(sg.default.map((s) => [s.id, s]))
    const byVideo = new Map()
    for (const list of tl.default) {
      byVideo.set(list.id, list.tracks.map((t) => {
        const s = songs[t.song]
        // Spotify's names when the song was matched, otherwise the ones read from the YouTube tracklist.
        const title = s.spotify_title || s.youtube_title || s.raw
        const artist = s.spotify_title ? s.spotify_artist : s.youtube_artist
        return { start: t.start, title, artist, spotifyId: s.spotify_id, isSong: s.kind === 'song', raw: s.raw }
      }))
    }
    return byVideo
  })
  return songsPromise
}

export const spotifyUrl = (track) => {
  if (!track?.isSong) return null
  if (track.spotifyId) return `https://open.spotify.com/track/${track.spotifyId}`
  const q = `${track.title} ${track.artist}`.replace(/\(\d{4}\)|\[[^\]]*\]|["“”]/g, ' ').replace(/\s+/g, ' ').trim()
  return q ? `https://open.spotify.com/search/${encodeURIComponent(q)}` : null
}
