import { useTranslation } from 'react-i18next'
import { useRadio } from '@/pages/Radio/RadioProvider'
import Icon from '@/components/Icon'
import IconButton from '@/components/IconButton'

// The YouTube iframe is mounted once and only moved or resized with CSS: unmounting it stops
// the music. "Hidden" moves it off-screen, where it keeps playing.
export default function Player({ className = '' }) {
  const { t } = useTranslation()
  const { playerHostRef, ytSize, ytHidden, setYtSize, setYtHidden, currentStation, game, started, usingFallback } = useRadio()
  const big = ytSize === 'big' && !ytHidden
  const visible = started && !!currentStation

  return (
    <section
      aria-label={t('player.label')}
      className={`${visible ? 'grid' : 'hidden'} items-center gap-x-3 gap-y-2.5 rounded-2xl border border-ring bg-white/4 p-2.5 ${big ? 'grid-cols-[1fr_auto_auto]' : 'grid-cols-[auto_1fr_auto_auto]'} ${className}`}
    >
      <div
        ref={playerHostRef}
        className={`player-frame aspect-video overflow-hidden rounded-lg bg-black ${
          ytHidden ? 'fixed top-0 -left-[10000px] w-[200px]' : big ? 'col-span-full row-start-2 w-full rounded-xl' : 'w-28'
        }`}
      />
      <div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-muted">
        <Icon name="youtube" className="size-3.5 text-[#ff0033]" />
        <span className="truncate" dir="auto">
          {currentStation ? `${currentStation.name} · ${game.label}` : 'YouTube'}
        </span>
        <span className="shrink-0 rounded-full bg-white/8 px-1.5 py-0.5 text-[10px] tracking-wide text-soft uppercase">
          {usingFallback ? t('station.fallback') : t('player.live')}
        </span>
      </div>
      {!ytHidden && (
        <IconButton
          icon={big ? 'minimize' : 'expand'}
          iconClass="size-3.5"
          size="sm"
          className="rounded-lg"
          label={big ? t('player.minimize') : t('player.expand')}
          onClick={() => setYtSize(big ? 'mini' : 'big')}
        />
      )}
      <IconButton
        icon={ytHidden ? 'eye' : 'eye-off'}
        iconClass="size-3.5"
        size="sm"
        className="rounded-lg"
        label={ytHidden ? t('player.show') : t('player.hide')}
        onClick={() => setYtHidden(!ytHidden)}
      />
    </section>
  )
}
