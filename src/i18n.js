import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LANG, LANG_CODES, LANGUAGES, langPath } from '@/config'
import { storage } from '@/utils/storage'

const modules = import.meta.glob('./locales/*.json', { eager: true, import: 'default' })
const resources = Object.fromEntries(Object.entries(modules).map(([path, data]) => [path.match(/(\w+)\.json$/)[1], { translation: data }]))

const BOT = /bot|crawl|spider|slurp|lighthouse|headless/i

function browserLanguage() {
  for (const tag of navigator.languages || [navigator.language]) {
    const code = tag?.toLowerCase().split('-')[0]
    if (LANG_CODES.includes(code)) return code
  }
  return null
}

// The path decides the language. At the root, a visitor who prefers another language is
// moved to that language's page; crawlers always get the Portuguese root.
export function detectLanguage() {
  const url = new URL(location.href)
  const legacy = url.searchParams.get('lang')
  if (legacy && LANG_CODES.includes(legacy)) {
    url.searchParams.delete('lang')
    history.replaceState(null, '', langPath(legacy) + url.search + url.hash)
    return legacy
  }
  const seg = location.pathname.split('/')[1]
  if (LANG_CODES.includes(seg)) return seg
  if (BOT.test(navigator.userAgent)) return DEFAULT_LANG
  const preferred = storage.get('lang', null) || browserLanguage() || 'en'
  if (preferred !== DEFAULT_LANG) history.replaceState(null, '', langPath(preferred) + location.search + location.hash)
  return preferred
}

export function applyDocumentLanguage(code) {
  const lang = LANGUAGES.find((l) => l.code === code)
  document.documentElement.lang = lang.html
  document.documentElement.dir = lang.rtl ? 'rtl' : 'ltr'
  document.title = i18n.t('meta.title')
}

export function changeLanguage(code) {
  storage.set('lang', code)
  history.pushState(null, '', langPath(code))
  return i18n.changeLanguage(code).then(() => applyDocumentLanguage(code))
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})
applyDocumentLanguage(i18n.language)

window.addEventListener('popstate', () => {
  const seg = location.pathname.split('/')[1]
  const code = LANG_CODES.includes(seg) ? seg : DEFAULT_LANG
  if (code !== i18n.language) i18n.changeLanguage(code).then(() => applyDocumentLanguage(code))
})

export default i18n
