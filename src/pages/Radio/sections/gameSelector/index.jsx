import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRadio } from '@/pages/Radio/RadioProvider'
import Icon from '@/components/Icon'
import IconButton from '@/components/IconButton'
import GameCoversDialog from './GameCoversDialog'

export default function GameSelector({ className = '' }) {
  const { t } = useTranslation()
  const { games, game, gameId, cycleGame, switchGame } = useRadio()
  const [open, setOpen] = useState(false)
  const swipeX = useRef(null)
  const close = useCallback(() => setOpen(false), [])

  const onTouchEnd = (e) => {
    if (swipeX.current === null) return
    const dx = e.changedTouches[0].clientX - swipeX.current
    swipeX.current = null
    if (Math.abs(dx) > 40) {
      e.preventDefault()
      const rtl = document.documentElement.dir === 'rtl'
      cycleGame((dx < 0) !== rtl ? 1 : -1)
    }
  }

  return (
    <section aria-label={t('game.label')} className={`flex flex-col gap-2 ${className}`}>
      <span className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase lg:hidden">{t('game.label')}</span>
      <div className="flex items-center gap-2">
        <IconButton icon="chevron-left" iconClass="size-[18px] rtl:-scale-x-100" label={t('game.prev')} onClick={() => cycleGame(-1)} />
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={t('game.pick')}
          onClick={() => setOpen(true)}
          onTouchStart={(e) => { swipeX.current = e.touches[0].clientX }}
          onTouchEnd={onTouchEnd}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-2 py-1 text-start text-fg transition hover:bg-white/6"
        >
          {game.logo ? (
            <img src={game.logo} alt={game.fullName} className="h-12 w-18 shrink-0 object-contain drop-shadow-[0_4px_14px_rgb(0_0_0/0.6)]" />
          ) : (
            <span
              className="grid size-12 shrink-0 place-items-center rounded-xl font-display text-[22px] font-bold text-[#111]"
              style={{ background: `linear-gradient(135deg, ${game.colors[0]}, ${game.colors[1]})` }}
            >
              {game.mark}
            </span>
          )}
          <span className="flex min-w-0 flex-col gap-0.5 overflow-hidden">
            <span className="line-clamp-2 font-display text-[19px] leading-tight font-bold tracking-[0.04em] uppercase">{game.label}</span>
            <span className="flex items-start gap-1 text-xs text-muted">
              <Icon name="pin" className="mt-px size-3" />
              <span>{game.place} · {game.year} · {t('game.stations', { count: game.stationCount })}</span>
            </span>
          </span>
        </button>
        <IconButton icon="chevron-right" iconClass="size-[18px] rtl:-scale-x-100" label={t('game.next')} onClick={() => cycleGame(1)} />
      </div>
      <div className="flex justify-center gap-1.5" aria-hidden="true">
        {games.map((g) => (
          <i key={g.id} className={`h-1.5 rounded-full transition-all ${g.id === gameId ? 'w-4.5 bg-fg' : 'w-1.5 bg-white/20'}`} />
        ))}
      </div>
      <GameCoversDialog
        open={open}
        games={games}
        gameId={gameId}
        onClose={close}
        onPick={(id) => { close(); if (id !== gameId) switchGame(id) }}
      />
    </section>
  )
}
