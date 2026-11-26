import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/config'
import { changeLanguage } from '@/i18n'
import Icon from '@/components/Icon'

export default function LanguageSelect() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [focus, setFocus] = useState(0)
  const root = useRef(null)
  const items = useRef([])
  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]

  useEffect(() => {
    if (!open) return
    items.current[focus]?.focus()
  }, [open, focus])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!root.current.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const toggle = () => {
    setFocus(Math.max(0, LANGUAGES.indexOf(current)))
    setOpen((o) => !o)
  }

  const pick = (code) => {
    setOpen(false)
    root.current.querySelector('button')?.focus()
    if (code !== i18n.language) changeLanguage(code)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      root.current.querySelector('button')?.focus()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      const dir = e.key === 'ArrowDown' ? 1 : -1
      setFocus((f) => (f + dir + LANGUAGES.length) % LANGUAGES.length)
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div ref={root} className="relative" onKeyDown={open ? onKeyDown : undefined}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t('language.label')}: ${current.label}`}
        onClick={toggle}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-white/12 bg-white/6 ps-3 pe-2.5 text-[13px] font-semibold text-fg transition hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-white"
      >
        <Icon name="globe" className="size-4 text-muted" />
        <span lang={current.html}>{current.label}</span>
        <Icon name="chevron-down" className={`size-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={t('language.label')}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute end-0 top-full z-50 mt-2 m-0 min-w-44 origin-top-right list-none rounded-2xl border border-ring bg-[rgb(20_20_28/0.96)] p-1.5 shadow-[0_16px_40px_rgb(0_0_0/0.5)] backdrop-blur-xl rtl:origin-top-left"
          >
            {LANGUAGES.map((l, i) => {
              const selected = l.code === current.code
              return (
                <li key={l.code} role="none">
                  <button
                    ref={(el) => { items.current[i] = el }}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    lang={l.html}
                    onClick={() => pick(l.code)}
                    onMouseEnter={() => setFocus(i)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border-0 px-3 py-2 text-start text-sm outline-none transition ${
                      selected ? 'bg-[color-mix(in_srgb,var(--c1)_18%,transparent)] font-semibold text-fg' : 'bg-transparent text-soft hover:bg-white/8 hover:text-fg focus:bg-white/8 focus:text-fg'
                    }`}
                  >
                    {l.label}
                    {selected && <span className="size-1.5 rounded-full bg-[var(--c1)]" aria-hidden="true" />}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
