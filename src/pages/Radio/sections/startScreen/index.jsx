import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useRadio } from '@/pages/Radio/RadioProvider'

// Browsers only allow audio after a user gesture, so the radio starts from this button.
export default function StartScreen() {
  const { t } = useTranslation()
  const { started, start } = useRadio()
  return (
    <AnimatePresence>
      {!started && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-[rgb(5_5_8/0.82)] p-6 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <button
              type="button"
              autoFocus
              onClick={start}
              className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--c1),var(--c2))] px-9 py-4.5 font-display text-[22px] font-bold tracking-[0.1em] text-[#111] uppercase shadow-[0_10px_40px_color-mix(in_srgb,var(--c1)_50%,transparent)] transition hover:scale-[1.03] active:scale-[0.98]"
            >
              {t('start.button')}
            </button>
            <p className="m-0 text-[13px] leading-relaxed text-muted">
              {t('start.note')}
              <br />
              {t('start.audio')}
              <br />
              {t('start.disclaimer')}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
