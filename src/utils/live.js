export const parseDuration = (s) => s.split(':').reduce((acc, n) => acc * 60 + Number(n), 0)

// Each video gets a fixed offset so the stations don't all start at the same point.
export const seedOf = (id) => [...id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % 100000

// The live position is derived from the clock, so everyone hears the same moment of a station.
export function livePosition(videoId, duration, now = Date.now()) {
  if (!duration) return 0
  return ((now / 1000) + seedOf(videoId)) % (duration - 5)
}

export function trackAt(tracks, position) {
  if (!tracks?.length) return null
  let found = tracks[0]
  for (const t of tracks) {
    if (t.start <= position) found = t
    else break
  }
  return found
}
