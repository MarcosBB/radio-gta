import { useCallback, useEffect, useRef, useState } from 'react'

let apiPromise = null

function loadApi() {
  apiPromise ??= new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT)
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
  return apiPromise
}

// The player lives in an element React does not render into: the IFrame API replaces it with
// an iframe, and the host element must never unmount or playback stops.
export function useYouTubePlayer(handlers) {
  const player = useRef(null)
  const handlersRef = useRef(handlers)
  const [host, setHost] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    if (!host || player.current) return
    let cancelled = false
    const target = document.createElement('div')
    host.appendChild(target)
    loadApi().then((YT) => {
      if (cancelled) return
      player.current = new YT.Player(target, {
        host: 'https://www.youtube-nocookie.com',
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0, iv_load_policy: 3 },
        events: {
          onReady: () => {
            player.current.setVolume(0)
            setReady(true)
            handlersRef.current.onReady?.()
          },
          onStateChange: (e) => handlersRef.current.onStateChange?.(e.data),
          onError: (e) => handlersRef.current.onError?.(e.data),
        },
      })
    })
    return () => { cancelled = true }
  }, [host])

  const hostRef = useCallback((el) => { if (el) setHost(el) }, [])

  return { hostRef, player, ready }
}

export const YT_STATE = { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 }
