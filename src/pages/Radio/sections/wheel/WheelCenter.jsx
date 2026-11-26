import { useTranslation } from 'react-i18next'
import Icon from '@/components/Icon'

function FavoriteButton({ favorite, onToggle, size = 'size-11' }) {
  const { t } = useTranslation()
  const label = favorite ? t('favorites.remove') : t('favorites.add')
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-pressed={favorite}
      title={label}
      className={`pointer-events-auto inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent transition hover:bg-white/8 active:scale-90 ${size} ${favorite ? 'text-star' : 'text-muted'}`}
    >
      <Icon name={favorite ? 'star-filled' : 'star'} className="size-6" />
    </button>
  )
}

// The star sticks to the last word, so it never wraps to a line of its own.
function NameWithStar({ name, star }) {
  if (!star) return name
  const cut = name.lastIndexOf(' ')
  return (
    <>
      {cut > 0 ? `${name.slice(0, cut)} ` : ''}
      <span className="inline-flex items-center whitespace-nowrap align-top">
        {name.slice(cut + 1)}
        {star}
      </span>
    </>
  )
}

function Song({ track, tuning, className }) {
  if (!track) return null
  return (
    <div className={`flex flex-col gap-0.5 transition-opacity duration-300 ${tuning ? 'opacity-35' : ''} ${className}`}>
      <span className="line-clamp-2 font-semibold" dir="auto">{track.title || track.raw}</span>
      {track.artist && <span className="line-clamp-1 text-[0.85em] text-soft" dir="auto">{track.artist}</span>}
    </div>
  )
}

// What the centre of the wheel says: the station under the selector (or under the finger while
// dragging), its genre and, for the station that is playing, the song.
export default function WheelCenter({ variant, geo, station, isCurrent, status, fallback, track, favorite, onToggleFavorite }) {
  const { t } = useTranslation()
  const name = station ? station.name : t('station.off')
  let genre = station ? station.genre : t('station.offHint')
  if (station && isCurrent && status === 'error') genre = t('station.unavailable')
  else if (station && isCurrent && fallback) genre = `${station.genre} · ${t('station.fallback')}`
  const song = station && isCurrent && status !== 'error' ? track : null

  if (variant === 'dial') {
    const width = Math.max(140, geo.R - geo.slot / 2 - 24)
    return (
      <>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 h-0.5 bg-[linear-gradient(90deg,transparent,var(--c1))] transition-[background] duration-500"
          style={{ top: geo.cy - 1, width: geo.R - geo.slot / 2 - 8 }}
        />
        <div className="pointer-events-none absolute left-4 flex flex-col gap-1" style={{ bottom: `calc(100% - ${geo.cy - 10}px)`, width }}>
          <p className="m-0 text-left text-[13px] text-muted" dir="auto">{genre}</p>
          <h2 className="m-0 text-left font-display text-[clamp(22px,7.4vw,30px)] leading-[1.02] font-bold uppercase" dir="auto">
            <NameWithStar name={name} star={station && <FavoriteButton favorite={favorite} onToggle={onToggleFavorite} size="size-11 -my-2 ms-0.5" />} />
          </h2>
        </div>
        {song && (
          <div className="pointer-events-none absolute left-4" style={{ top: geo.cy + 14, width }}>
            <Song track={song} tuning={status === 'tuning'} className="text-left text-[15px]" />
          </div>
        )}
      </>
    )
  }

  const inner = Math.max(160, (geo.R - geo.slot * 0.9) * 2 * 0.86)
  return (
    <div
      className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2 text-center"
      style={{ left: geo.cx, top: geo.cy, width: inner }}
    >
      {station?.logo && (
        <img
          src={station.logo}
          alt=""
          className={`mb-1 aspect-square object-contain drop-shadow-[0_4px_12px_rgb(0_0_0/0.6)] ${station.light ? 'rounded-[18%] bg-[#f2f2f5] p-[3%]' : ''}`}
          style={{ width: Math.min(120, inner * 0.3) }}
        />
      )}
      <h2 className="m-0 font-display text-[clamp(22px,3.2vw,42px)] leading-[1.04] font-bold tracking-[0.02em] uppercase" dir="auto">
        <NameWithStar name={name} star={station && <FavoriteButton favorite={favorite} onToggle={onToggleFavorite} size="size-11 -my-2 ms-1" />} />
      </h2>
      <p className="m-0 text-[15px] text-muted" dir="auto">{genre}</p>
      {song && <Song track={song} tuning={status === 'tuning'} className="mt-2 text-[17px]" />}
    </div>
  )
}
