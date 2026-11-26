import { storage } from '@/utils/storage'
import { findStationId, getGamesData, stationIdsOf } from '@/services/contentService'

// Version 1 (the single-file site) stored presets as { g, name } and the last station per game
// as an array index. Convert both to station ids once, so nobody loses their presets.
export function migrateStorage() {
  if (storage.get('storageVersion', 1) >= 2) return
  const presets = storage.get('presets', null)
  if (Array.isArray(presets)) {
    storage.set('presets', presets.map((p) => {
      if (p && typeof p === 'object') return findStationId(p.g, p.name)
      return typeof p === 'string' ? p : null
    }))
  }
  const last = {}
  for (const game of getGamesData()) {
    const ids = stationIdsOf(game.id)
    const i = storage.get(`lastOn_${game.id}`, null) ?? storage.get(`last_${game.id}`, null)
    if (Number.isInteger(i) && ids[i]) last[game.id] = ids[i]
    storage.remove(`last_${game.id}`)
    storage.remove(`lastOn_${game.id}`)
  }
  storage.set('lastStation', last)
  storage.set('storageVersion', 2)
}
