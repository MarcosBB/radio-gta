import { useCallback, useMemo } from 'react'
import { useStoredState } from '@/hooks/useStoredState'

export function useFavorites() {
  const [list, setList] = useStoredState('favorites', [])
  const favorites = useMemo(() => new Set(list), [list])
  const toggleFavorite = useCallback((id) => {
    const added = !list.includes(id)
    setList(added ? [...list, id] : list.filter((x) => x !== id))
    return added
  }, [list, setList])
  return { favorites, toggleFavorite }
}
