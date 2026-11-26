import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { HOLD_TO_SAVE_MS } from '@/config'
import StationBadge from '@/components/StationBadge'

// Tap recalls the preset, holding saves the current station into it, like a car radio.
export default function PresetButton({ n, station, active, onRecall, onSave }) {
  const { t } = useTranslation()
  const timer = useRef(null)
  const held = useRef(false)
  const [holding, setHolding] = useState(false)
  const [savedKey, setSavedKey] = useState(0)

  const cancel = () => {
    clearTimeout(timer.current)
    setHolding(false)
  }
  const onPointerDown = (e) => {
    if (e.button > 0) return
    held.current = false
    setHolding(true)
    timer.current = setTimeout(() => {
      held.current = true
      setHolding(false)
      if (onSave()) setSavedKey(Date.now())
    }, HOLD_TO_SAVE_MS)
  }
  const onPointerUp = () => {
    cancel()
    if (!held.current) onRecall()
  }

  const label = station ? t('presets.aria', { n, name: station.name }) : t('presets.emptyAria', { n })
  const title = station ? t('presets.holdToReplace', { n, name: station.name }) : t('presets.empty', { n })

  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onRecall() } }}
      className={`relative grid h-13 cursor-pointer touch-manipulation place-items-center overflow-hidden rounded-[14px] border p-0 font-display text-lg font-bold text-muted select-none [-webkit-touch-callout:none] active:scale-[0.97] ${
        active ? 'border-[var(--c1)] shadow-[inset_0_0_0_1px_var(--c1)]' : station ? 'border-white/12' : 'border-dashed border-white/18 text-white/30'
      } ${station?.light ? 'bg-[#e9e9ee]!' : ''}`}
      style={active ? { background: 'color-mix(in srgb, var(--c1) 16%, transparent)' } : undefined}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 origin-left bg-[color-mix(in_srgb,var(--c1)_45%,transparent)] rtl:origin-right"
        style={{ transform: holding ? 'scaleX(1)' : 'scaleX(0)', transition: holding ? `transform ${HOLD_TO_SAVE_MS}ms linear` : 'none' }}
      />
      {savedKey > 0 && (
        <motion.span
          key={savedKey}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[var(--c1)]"
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
      <span className={`absolute top-1 start-1.5 font-sans text-[10px] font-bold ${active ? 'text-[var(--c1)]' : 'text-muted'}`}>{n}</span>
      {station ? (
        <span
          className="relative grid size-full place-items-center"
          style={!station.logo ? { background: `linear-gradient(135deg, ${station.colors[0]}, ${station.colors[1]})` } : undefined}
        >
          <StationBadge station={station} className="max-h-[70%] max-w-[72%]" textClass="text-[12px]" />
        </span>
      ) : (
        <span className="relative">{n}</span>
      )}
    </button>
  )
}
