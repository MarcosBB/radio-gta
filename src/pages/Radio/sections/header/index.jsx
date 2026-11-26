import { SITE_NAME } from '@/config'
import LanguageSelect from './LanguageSelect'

export default function Header() {
  const [first, second] = SITE_NAME.split(' ')
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between px-4 lg:h-16 lg:px-8">
      <h1 className="m-0 font-display text-xl font-bold tracking-[0.08em] uppercase lg:text-2xl" dir="ltr" translate="no">
        {first} <span className="text-[var(--c1)] transition-colors duration-500">{second}</span>
      </h1>
      <LanguageSelect />
    </header>
  )
}
