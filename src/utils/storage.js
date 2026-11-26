export const storage = {
  get(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key))
      return v ?? fallback
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // private mode or full storage: settings just won't persist
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
}
