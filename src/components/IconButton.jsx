import { tv } from 'tailwind-variants'
import Icon from '@/components/Icon'

const iconButton = tv({
  base: 'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-ring bg-white/5 text-fg transition hover:bg-white/12 active:scale-95 disabled:cursor-default disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
  variants: {
    size: {
      sm: 'size-9',
      md: 'size-11',
      lg: 'size-13',
      xl: 'size-16',
    },
    tone: {
      default: '',
      power: 'border-[color-mix(in_srgb,var(--c1)_60%,transparent)] bg-[color-mix(in_srgb,var(--c1)_24%,transparent)] text-white',
      powerOff: 'text-muted',
      spotify: 'text-spotify no-underline',
      ghost: 'border-transparent bg-transparent hover:bg-white/8',
    },
  },
  defaultVariants: { size: 'md', tone: 'default' },
})

export default function IconButton({ icon, label, size, tone, iconClass = 'size-5', href, className, ...props }) {
  const cls = iconButton({ size, tone, className })
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener" aria-label={label} title={label} className={cls} {...props}>
        <Icon name={icon} className={iconClass} />
      </a>
    )
  }
  return (
    <button type="button" aria-label={label} title={label} className={cls} {...props}>
      <Icon name={icon} className={iconClass} />
    </button>
  )
}
