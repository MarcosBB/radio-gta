import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import IconButton from '@/components/IconButton'

export default function GameCoversDialog({ open, games, gameId, onPick, onClose }) {
  const { t } = useTranslation()
  const selected = useRef(null)

  useEffect(() => {
    if (!open) return
    selected.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Portalled: the mobile panel is transformed, which would trap a fixed overlay inside it.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t('game.pickTitle')}
          className="fixed inset-0 z-40 grid place-items-center bg-[rgb(5_5_8/0.78)] p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            className="max-h-[calc(100dvh-32px)] w-full max-w-[720px] overflow-auto rounded-3xl border border-ring bg-[#14141b] p-4 sm:p-5"
            initial={{ y: 16, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 16, scale: 0.98 }}
          >
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="m-0 font-display text-base font-bold tracking-[0.12em] uppercase">{t('game.pickTitle')}</h2>
              <IconButton icon="close" label={t('close')} size="sm" tone="ghost" onClick={onClose} />
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
              {games.map((g) => (
                <button
                  key={g.id}
                  ref={g.id === gameId ? selected : undefined}
                  type="button"
                  aria-label={`${g.fullName}, ${t('game.stations', { count: g.stationCount })}`}
                  aria-current={g.id === gameId}
                  onClick={() => onPick(g.id)}
                  className={`group relative flex aspect-square cursor-pointer flex-col justify-end overflow-hidden rounded-2xl border-2 p-3 text-start text-white transition hover:-translate-y-0.5 sm:aspect-[4/3] sm:p-3.5 ${g.id === gameId ? 'border-white' : 'border-transparent'}`}
                  style={{ background: `linear-gradient(180deg, transparent 35%, rgb(0 0 0 / 0.75)), linear-gradient(140deg, ${g.colors[0]}, ${g.colors[1]})` }}
                >
                  {g.logo ? (
                    <img src={g.logo} alt="" className="absolute top-[34%] left-1/2 h-[44%] w-[78%] -translate-1/2 object-contain drop-shadow-[0_6px_16px_rgb(0_0_0/0.45)] transition group-hover:scale-105" />
                  ) : (
                    <span className="absolute top-[34%] left-1/2 -translate-1/2 font-display text-7xl font-bold text-white/90">{g.mark}</span>
                  )}
                  <span className="relative flex flex-col items-start gap-1.5">
                    <span className="flex gap-1">
                      {g.previewLogos.map((l) => (
                        <img key={l.src} src={l.src} alt="" loading="lazy" className={`size-6 rounded-full object-contain p-[3px] ${l.light ? 'bg-[#f2f2f5]' : 'bg-black/45'}`} />
                      ))}
                    </span>
                    <span className="max-w-full truncate text-[11px] leading-snug opacity-90">
                      {g.place} · {g.year}
                      <br />
                      {t('game.stations', { count: g.stationCount })}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
