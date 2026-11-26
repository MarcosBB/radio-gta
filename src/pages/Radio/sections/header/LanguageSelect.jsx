import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/config'
import { changeLanguage } from '@/i18n'
import Icon from '@/components/Icon'

export default function LanguageSelect() {
  const { t, i18n } = useTranslation()
  return (
    <label className="relative inline-flex h-9 items-center gap-1.5 rounded-full border border-white/12 bg-white/6 ps-3 pe-2.5 text-[13px] font-semibold text-fg transition hover:bg-white/12 focus-within:outline-2 focus-within:outline-white">
      <Icon name="globe" className="size-4 text-muted" />
      <span className="sr-only">{t('language.label')}</span>
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="cursor-pointer appearance-none border-0 bg-transparent pe-4 text-inherit outline-none"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} lang={l.html} className="bg-[#14141b] text-fg">{l.label}</option>
        ))}
      </select>
      <Icon name="chevron-down" className="pointer-events-none absolute end-2.5 size-3" />
    </label>
  )
}
