import { useSyncExternalStore } from 'react'

export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const DESKTOP_QUERY = '(min-width: 900px) and (min-aspect-ratio: 5/4)'
export const useIsDesktop = () => useMediaQuery(DESKTOP_QUERY)
export const useHasMouse = () => useMediaQuery('(hover: hover) and (pointer: fine)')
