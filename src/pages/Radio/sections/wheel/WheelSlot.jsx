import { motion } from 'motion/react'
import { tv } from 'tailwind-variants'
import { WHEEL } from '@/config'
import Icon from '@/components/Icon'
import StationBadge from '@/components/StationBadge'

const face = tv({
  base: 'relative flex size-full items-center justify-center rounded-full transition-[box-shadow,filter,opacity] duration-200',
  variants: {
    kind: {
      logo: 'bg-[radial-gradient(circle_at_50%_35%,#2a2a33,#0d0d12_75%)]',
      light: 'bg-[radial-gradient(circle_at_50%_35%,#ffffff,#d9d9e0_80%)]',
      badge: 'shadow-[inset_0_0_0_2px_rgb(255_255_255/0.18)]',
      off: 'bg-[#222] text-[#c9c9d4]',
    },
    active: {
      true: 'shadow-[0_0_0_3px_#fff,0_0_28px_var(--glow)]',
      false: 'opacity-80 shadow-[0_6px_18px_rgb(0_0_0/0.45)] brightness-90 hover:opacity-100 hover:brightness-100',
    },
  },
})

export default function WheelSlot({ station, index, angle, radius, size, active, current, favorite, counterRotate, label, onSelect, onHover }) {
  const a = (angle * Math.PI) / 180
  const kind = !station ? 'off' : !station.logo ? 'badge' : station.light ? 'light' : 'logo'
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={current}
      title={label}
      onClick={() => onSelect(index)}
      onMouseEnter={() => onHover(index)}
      className="absolute cursor-pointer rounded-full border-0 bg-transparent p-0 transition-[left,top] duration-250 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      style={{
        left: radius * Math.sin(a) - size / 2,
        top: -radius * Math.cos(a) - size / 2,
        width: size,
        height: size,
      }}
    >
      <motion.span
        className="block size-full"
        style={{ rotate: counterRotate }}
        animate={{ scale: active ? WHEEL.selectedScale : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <span
          className={face({ kind, active })}
          style={{
            '--glow': station ? `color-mix(in srgb, ${station.colors[0]} 70%, transparent)` : 'transparent',
            background: kind === 'badge' ? `linear-gradient(135deg, ${station.colors[0]}, ${station.colors[1]})` : undefined,
          }}
        >
          {station ? (
            <StationBadge station={station} className="size-[78%]" textClass="text-[length:calc(var(--slot)*0.19)]" />
          ) : (
            <Icon name="power" className="size-[42%]" />
          )}
          {favorite && (
            <span className="absolute -top-0.5 -right-0.5 flex size-[30%] min-h-4 min-w-4 items-center justify-center rounded-full border border-white/20 bg-[#16161e] text-star">
              <Icon name="star-filled" className="size-[60%]" />
            </span>
          )}
        </span>
      </motion.span>
    </button>
  )
}
