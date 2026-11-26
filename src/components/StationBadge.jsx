// The station's logo, or a gradient badge with its short name when it has no logo.
export default function StationBadge({ station, className = '', textClass = 'text-[13px]' }) {
  if (station.logo) {
    return <img src={station.logo} alt="" draggable="false" className={`pointer-events-none object-contain ${className}`} />
  }
  return (
    <span
      className={`flex items-center justify-center whitespace-pre text-center font-display font-bold leading-[1.05] text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.6)] ${textClass} ${className}`}
    >
      {station.short}
    </span>
  )
}
