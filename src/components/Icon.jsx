const icons = import.meta.glob('@/assets/icons/*.svg', { eager: true, query: '?raw', import: 'default' })
const byName = Object.fromEntries(Object.entries(icons).map(([path, svg]) => [path.match(/([\w-]+)\.svg$/)[1], svg]))

export default function Icon({ name, className = 'size-5' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 [&>svg]:size-full ${className}`}
      dangerouslySetInnerHTML={{ __html: byName[name] }}
    />
  )
}
