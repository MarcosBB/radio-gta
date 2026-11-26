export const SITE_URL = 'https://radio-wheel.marcosbb.com'
export const SITE_NAME = 'Radio Wheel'

// Portuguese is served at the site root, every other language under /<code>/.
export const DEFAULT_LANG = 'pt'
export const LANGUAGES = [
  { code: 'pt', html: 'pt-BR', label: 'Português', og: 'pt_BR' },
  { code: 'en', html: 'en', label: 'English', og: 'en_US' },
  { code: 'es', html: 'es', label: 'Español', og: 'es_ES' },
  { code: 'fr', html: 'fr', label: 'Français', og: 'fr_FR' },
  { code: 'zh', html: 'zh-Hans', label: '中文', og: 'zh_CN' },
  { code: 'hi', html: 'hi', label: 'हिन्दी', og: 'hi_IN' },
  { code: 'ar', html: 'ar', label: 'العربية', og: 'ar_AR', rtl: true },
  { code: 'ru', html: 'ru', label: 'Русский', og: 'ru_RU' },
]
export const LANG_CODES = LANGUAGES.map((l) => l.code)

export const langPath = (code) => (code === DEFAULT_LANG ? '/' : `/${code}/`)

export const PRESET_COUNT = 6
export const HOLD_TO_SAVE_MS = 700
export const DEFAULT_VOLUME = 80
export const DEFAULT_GAME = 'gta6'

// Shortest static burst while tuning, like in the game.
export const MIN_TUNING_MS = 500
// Time to wait for a video to start before trying the fallback one.
export const PLAY_TIMEOUT_MS = 9000

export const WHEEL = {
  slotMax: 96,
  slotMin: 44,
  // Fraction of the arc between two slot centres a slot may take, so icons never touch.
  slotFill: 0.74,
  selectedScale: 1.16,
  selectedPush: 0.18,
}
