import { useEffect, useRef } from 'react'
import { PRESET_COUNT } from '@/config'
import { useRadio } from '@/pages/Radio/RadioProvider'

export function useKeyboardShortcuts() {
  const radio = useRadio()
  const ref = useRef(radio)
  useEffect(() => { ref.current = radio })

  useEffect(() => {
    const onKey = (e) => {
      const r = ref.current
      if (!r.started || e.metaKey || e.ctrlKey || e.altKey) return
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return
      if (document.querySelector('[role="dialog"]')) return
      const n = Number(e.key)
      if (n >= 1 && n <= PRESET_COUNT) return r.recallPreset(n - 1)
      const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'MediaTrackNext'
      const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'MediaTrackPrevious'
      if (forward || back) {
        e.preventDefault()
        r.step(forward ? 1 : -1)
      } else if (e.key === ' ' && e.target.tagName !== 'BUTTON') {
        e.preventDefault()
        r.togglePower()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
}
