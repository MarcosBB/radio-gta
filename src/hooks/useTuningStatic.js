import { useCallback, useEffect, useRef } from 'react'

const SOUND_URL = '/sounds/sintonia.m4a'

// ~50 s of an FM dial being turned. Each tune starts it at a random point, so every switch
// sounds a little different, like turning a real dial.
export function useTuningStatic(volumeRef) {
  const ctx = useRef(null)
  const buffer = useRef(null)
  const data = useRef(null)
  const nodes = useRef(null)

  useEffect(() => {
    data.current = fetch(SOUND_URL).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null)
  }, [])

  const init = useCallback(() => {
    if (!ctx.current) {
      ctx.current = new (window.AudioContext || window.webkitAudioContext)()
      data.current?.then((d) => d && ctx.current.decodeAudioData(d)).then((b) => { if (b) buffer.current = b }).catch(() => {})
    }
    if (ctx.current.state === 'suspended') ctx.current.resume()
  }, [])

  const stop = useCallback((fade = 0.35) => {
    const ac = ctx.current
    if (!nodes.current || !ac) return
    const { src, out } = nodes.current
    nodes.current = null
    const t = ac.currentTime
    out.gain.cancelScheduledValues(t)
    out.gain.setValueAtTime(out.gain.value, t)
    out.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(fade, 0.01))
    src.stop(t + fade + 0.05)
  }, [])

  const start = useCallback(() => {
    const ac = ctx.current
    if (!ac || !buffer.current) return
    stop(0)
    const t = ac.currentTime
    const src = ac.createBufferSource()
    src.buffer = buffer.current
    src.loop = true
    const out = ac.createGain()
    const level = 0.8 * (volumeRef.current / 100)
    out.gain.setValueAtTime(0.0001, t)
    out.gain.exponentialRampToValueAtTime(Math.max(level, 0.0002), t + 0.04)
    src.connect(out).connect(ac.destination)
    src.start(t, Math.random() * Math.max(0, buffer.current.duration - 5))
    nodes.current = { src, out }
  }, [stop, volumeRef])

  const burst = useCallback(() => {
    start()
    setTimeout(() => stop(0.2), 220)
  }, [start, stop])

  return { init, start, stop, burst }
}
