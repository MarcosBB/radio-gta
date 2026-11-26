import { useMemo } from 'react'

// A silent looping <audio> makes Chrome send media keys to the page. Without it the YouTube
// iframe owns the media session, and it has no previous/next track.
function silentAudio() {
  const rate = 8000
  const n = rate * 10
  const buf = new Uint8Array(44 + n)
  const dv = new DataView(buf.buffer)
  const w = (o, s) => [...s].forEach((c, k) => { buf[o + k] = c.charCodeAt(0) })
  w(0, 'RIFF')
  dv.setUint32(4, 36 + n, true)
  w(8, 'WAVEfmt ')
  dv.setUint32(16, 16, true)
  dv.setUint16(20, 1, true)
  dv.setUint16(22, 1, true)
  dv.setUint32(24, rate, true)
  dv.setUint32(28, rate, true)
  dv.setUint16(32, 1, true)
  dv.setUint16(34, 8, true)
  w(36, 'data')
  dv.setUint32(40, n, true)
  buf.fill(128, 44)
  const audio = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })))
  audio.loop = true
  return audio
}

export function useKeepAlive() {
  return useMemo(() => {
    let audio = null
    return {
      play: () => {
        audio ??= silentAudio()
        audio.play().catch(() => {})
      },
      pause: () => audio?.pause(),
    }
  }, [])
}
