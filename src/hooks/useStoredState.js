import { useCallback, useState } from 'react'
import { storage } from '@/utils/storage'

export function useStoredState(key, initial) {
  const [value, setValue] = useState(() => storage.get(key, initial))
  const set = useCallback((next) => {
    setValue((prev) => {
      const v = typeof next === 'function' ? next(prev) : next
      storage.set(key, v)
      return v
    })
  }, [key])
  return [value, set]
}
