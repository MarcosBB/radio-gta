import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { animate, useMotionValue, useTransform, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { OFF, useRadio } from '@/pages/Radio/RadioProvider'
import { angleOf, mod, nearestIndex, wheelGeometry } from '@/utils/wheel'
import WheelSlot from './WheelSlot'
import WheelCenter from './WheelCenter'

const SPRING = { type: 'spring', stiffness: 220, damping: 30 }

function useSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

export default function Wheel({ variant }) {
  const { t } = useTranslation()
  const radio = useRadio()
  const { stations, currentId, previewId, favorites, status, track, usingFallback } = radio
  const box = useRef(null)
  const size = useSize(box)

  const ids = useMemo(() => [OFF, ...stations.map((s) => s.id)], [stations])
  const count = ids.length
  const step = 360 / count
  const geo = useMemo(() => (size.width ? wheelGeometry({ ...size, count, variant }) : null), [size, count, variant])
  const selector = variant === 'dial' ? 90 : 0

  const targetIndex = Math.max(0, ids.indexOf(previewId ?? currentId ?? OFF))
  const rotation = useMotionValue(selector - targetIndex * step)
  const counterRotation = useTransform(rotation, (v) => -v)
  const [dragIndex, setDragIndex] = useState(null)
  const [hoverIndex, setHoverIndex] = useState(null)
  const drag = useRef(null)
  const lastWheel = useRef(0)

  useEffect(() => {
    if (drag.current?.moved) return
    const base = selector - targetIndex * step
    const to = base + 360 * Math.round((rotation.get() - base) / 360)
    const controls = animate(rotation, to, SPRING)
    return () => controls.stop()
  }, [targetIndex, step, selector, rotation])

  const select = (i) => {
    const id = ids[i]
    radio.tune(id === OFF ? null : id)
  }

  const pointerAngle = (e) => {
    const r = box.current.getBoundingClientRect()
    return angleOf(e.clientX - r.left - geo.cx, e.clientY - r.top - geo.cy)
  }

  const onPointerDown = (e) => {
    if (!geo || e.button > 0) return
    rotation.stop()
    drag.current = { last: pointerAngle(e), total: 0, start: rotation.get(), pointer: e.pointerId, moved: false }
  }

  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const a = pointerAngle(e)
    let delta = a - d.last
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    d.last = a
    d.total += delta
    if (!d.moved && Math.abs(d.total) > 3) {
      d.moved = true
      box.current.setPointerCapture(d.pointer)
    }
    if (!d.moved) return
    rotation.set(d.start + d.total)
    const i = nearestIndex(rotation.get(), selector, step, count)
    if (i !== dragIndex) {
      setDragIndex(i)
      if (navigator.vibrate) navigator.vibrate(6)
    }
  }

  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    const k = Math.round((selector - rotation.get()) / step)
    animate(rotation, selector - k * step, SPRING)
    setDragIndex(null)
    setHoverIndex(null)
    select(mod(k, count))
  }

  const onWheel = (e) => {
    if (Math.abs(e.deltaY) < 4) return
    const now = performance.now()
    if (now - lastWheel.current < 120) return
    lastWheel.current = now
    radio.step(e.deltaY > 0 ? 1 : -1)
  }

  const activeIndex = dragIndex ?? targetIndex
  const displayIndex = dragIndex ?? hoverIndex ?? targetIndex
  const displayed = displayIndex > 0 ? stations[displayIndex - 1] : null

  return (
    <div
      ref={box}
      role="group"
      aria-label={t('wheel.label')}
      dir="ltr"
      className="relative size-full touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseLeave={() => setHoverIndex(null)}
      onWheel={variant === 'dial' ? undefined : onWheel}
    >
      {geo && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full border border-dashed border-white/10"
            style={{ left: geo.cx - geo.R, top: geo.cy - geo.R, width: geo.R * 2, height: geo.R * 2 }}
          />
          {variant === 'dial' ? (
            <p className="pointer-events-none absolute top-2 left-4 m-0 text-xs tracking-wide text-muted">{t('wheel.dialHint')}</p>
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 18 12"
              className="pointer-events-none absolute w-5 fill-[var(--c1)] transition-[fill] duration-500"
              style={{ left: geo.cx - 10, top: geo.cy - geo.R - geo.push - (geo.slot * 1.16) / 2 - 18 }}
            >
              <path d="M1 1h16L9 11z" />
            </svg>
          )}
          <motion.div
            className="absolute size-0"
            style={{ left: geo.cx, top: geo.cy, rotate: rotation, '--slot': `${geo.slot}px` }}
          >
            {ids.map((id, i) => {
              const station = i > 0 ? stations[i - 1] : null
              return (
                <WheelSlot
                  key={id}
                  station={station}
                  index={i}
                  angle={i * step}
                  radius={geo.R + (i === activeIndex ? geo.push : 0)}
                  size={geo.slot}
                  active={i === activeIndex}
                  current={(station?.id ?? null) === currentId}
                  favorite={!!station && favorites.has(station.id)}
                  counterRotate={counterRotation}
                  label={station ? station.name : t('wheel.turnOff')}
                  onSelect={select}
                  onHover={variant === 'dial' ? () => {} : setHoverIndex}
                />
              )
            })}
          </motion.div>
          <WheelCenter
            variant={variant}
            geo={geo}
            station={displayed}
            isCurrent={(displayed?.id ?? null) === currentId}
            status={status}
            fallback={usingFallback}
            track={track}
            favorite={!!displayed && favorites.has(displayed.id)}
            onToggleFavorite={() => displayed && radio.toggleFavorite(displayed.id)}
          />
        </>
      )}
    </div>
  )
}
