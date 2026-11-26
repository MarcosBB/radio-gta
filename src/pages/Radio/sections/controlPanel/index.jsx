import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { animate, motion, useDragControls, useMotionValue } from 'motion/react'
import { useTranslation } from 'react-i18next'
import GameSelector from '@/pages/Radio/sections/gameSelector'
import Presets from '@/pages/Radio/sections/presets'
import Player from '@/pages/Radio/sections/player'
import Transport from './Transport'

const SPRING = { type: 'spring', stiffness: 380, damping: 38 }
const card = 'rounded-[20px] border border-ring bg-panel p-4'

// One element for both layouts: a bottom sheet on phones, a column of cards on desktop.
// Switching layout must not remount it, because the YouTube player lives inside.
export default function ControlPanel({ isDesktop }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [closedOffset, setClosedOffset] = useState(0)
  const sheet = useRef(null)
  const peek = useRef(null)
  const y = useMotionValue(0)
  const dragControls = useDragControls()
  const dragged = useRef(false)

  useLayoutEffect(() => {
    if (isDesktop) return
    const measure = () => {
      const visible = peek.current.offsetTop + peek.current.offsetHeight + 14
      setClosedOffset(Math.max(0, sheet.current.offsetHeight - visible))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(sheet.current)
    return () => ro.disconnect()
  }, [isDesktop])

  useEffect(() => {
    if (isDesktop) {
      y.set(0)
      return
    }
    const controls = animate(y, open ? 0 : closedOffset, SPRING)
    return () => controls.stop()
  }, [open, closedOffset, isDesktop, y])

  // The Android back button closes the open sheet instead of leaving the site.
  useEffect(() => {
    if (!open || isDesktop) return
    history.pushState({ sheet: true }, '')
    const onPop = () => setOpen(false)
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      if (history.state?.sheet) history.back()
    }
  }, [open, isDesktop])

  const onDragEnd = (_, info) => {
    dragged.current = true
    const next = info.velocity.y < -300 || (info.velocity.y <= 300 && y.get() < closedOffset / 2)
    if (next === open) animate(y, next ? 0 : closedOffset, SPRING)
    setOpen(next)
  }

  const toggle = useCallback(() => {
    if (dragged.current) {
      dragged.current = false
      return
    }
    setOpen((o) => !o)
  }, [])

  return (
    <>
      {!isDesktop && open && (
        <button type="button" aria-label={t('sheet.close')} onClick={() => setOpen(false)} className="fixed inset-0 z-20 cursor-pointer border-0 bg-black/45" />
      )}
      <motion.section
        ref={sheet}
        aria-label={t('controls.label')}
        drag={isDesktop ? false : 'y'}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: closedOffset }}
        dragElastic={0.06}
        onDragEnd={onDragEnd}
        style={{ y }}
        className={
          isDesktop
            ? 'relative z-10 flex w-[400px] shrink-0 flex-col gap-4 self-center'
            : 'fixed inset-x-0 bottom-0 z-30 flex max-h-[88dvh] flex-col rounded-t-[28px] border-t border-white/10 bg-[rgb(18_18_26/0.95)] pb-[max(16px,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgb(0_0_0/0.45)] backdrop-blur-xl'
        }
      >
        <button
          type="button"
          aria-label={open ? t('sheet.close') : t('sheet.open')}
          aria-expanded={open}
          onClick={toggle}
          onPointerDown={(e) => { dragged.current = false; dragControls.start(e) }}
          className={isDesktop ? 'hidden' : 'flex h-7.5 w-full shrink-0 cursor-grab touch-none items-center justify-center border-0 bg-transparent p-0'}
        >
          <span className="h-1.25 w-11 rounded-full bg-white/28" />
        </button>
        <div className={isDesktop ? 'contents' : 'flex min-h-0 flex-col gap-5 overflow-y-auto px-5'}>
          <div ref={peek} className={isDesktop ? `order-2 ${card}` : 'order-1 pb-1'}>
            <Transport compact={!isDesktop} />
          </div>
          <GameSelector className={isDesktop ? `order-1 ${card} py-3` : 'order-2 border-t border-white/8 pt-4'} />
          <Presets className={isDesktop ? `order-3 ${card}` : 'order-3'} />
          <Player className={isDesktop ? `order-4 border-ring bg-panel` : 'order-4'} />
        </div>
      </motion.section>
    </>
  )
}
