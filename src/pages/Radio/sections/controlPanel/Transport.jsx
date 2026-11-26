import { useTranslation } from 'react-i18next'
import { useRadio } from '@/pages/Radio/RadioProvider'
import IconButton from '@/components/IconButton'
import Icon from '@/components/Icon'

function VolumeIcon({ volume }) {
  return <Icon name={volume === 0 ? 'volume-mute' : volume < 50 ? 'volume-low' : 'volume-high'} className="size-5.5" />
}

export default function Transport({ compact, className = '' }) {
  const { t } = useTranslation()
  const { step, togglePower, currentId, spotify, volume, setVolume, toggleMute } = useRadio()
  const on = !!currentId
  const muteLabel = volume === 0 ? t('controls.unmute') : t('controls.mute')

  const power = (
    <IconButton
      icon="power"
      size={compact ? 'xl' : 'lg'}
      iconClass="size-6"
      tone={on ? 'power' : 'powerOff'}
      label={t('controls.power')}
      aria-pressed={on}
      onClick={togglePower}
    />
  )
  const spotifyButton = (
    <IconButton
      icon="spotify"
      tone="spotify"
      iconClass="size-[22px]"
      label={t('controls.spotify')}
      href={spotify || undefined}
      className={spotify ? '' : 'invisible'}
    />
  )

  if (compact) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <button type="button" aria-label={muteLabel} title={muteLabel} onClick={toggleMute} className="grid size-11 cursor-pointer place-items-center rounded-full border border-ring bg-white/5 text-fg">
          <VolumeIcon volume={volume} />
        </button>
        <div className="flex items-center gap-4">
          <IconButton icon="prev" size="lg" iconClass="size-[22px] rtl:-scale-x-100" label={t('controls.prev')} onClick={() => step(-1)} />
          {power}
          <IconButton icon="next" size="lg" iconClass="size-[22px] rtl:-scale-x-100" label={t('controls.next')} onClick={() => step(1)} />
        </div>
        {spotifyButton}
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="relative flex items-center justify-center gap-4">
        <IconButton icon="prev" size="lg" iconClass="size-[22px] rtl:-scale-x-100" label={t('controls.prev')} onClick={() => step(-1)} />
        {power}
        <IconButton icon="next" size="lg" iconClass="size-[22px] rtl:-scale-x-100" label={t('controls.next')} onClick={() => step(1)} />
        <span className="absolute end-0">{spotifyButton}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <button type="button" aria-label={muteLabel} title={muteLabel} onClick={toggleMute} className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-muted hover:text-fg">
          <VolumeIcon volume={volume} />
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          aria-label={t('controls.volume')}
          onChange={(e) => setVolume(+e.target.value)}
          style={{ '--v': `${volume}%` }}
          dir="ltr"
        />
        <span className="w-8 shrink-0 text-end text-xs font-semibold text-muted tabular-nums">{volume}</span>
      </div>
    </div>
  )
}
