import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRadio } from '@/pages/Radio/RadioProvider'
import { getStationById } from '@/services/contentService'
import { useHasMouse } from '@/hooks/useMediaQuery'
import PresetButton from './PresetButton'

export default function Presets({ className = '' }) {
  const { t, i18n } = useTranslation()
  const { presets, currentId, recallPreset, savePreset } = useRadio()
  const hasMouse = useHasMouse()
  const stations = useMemo(() => presets.map((id) => (id ? getStationById(id, i18n.language) : null)), [presets, i18n.language])

  return (
    <section aria-label={t('presets.title')} className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="m-0 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">{t('presets.title')}</h2>
        <span className="truncate text-xs text-muted">{hasMouse ? t('presets.hintMouse') : t('presets.hintTouch')}</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {stations.map((station, k) => (
          <PresetButton
            key={k}
            n={k + 1}
            station={station}
            active={!!station && station.id === currentId}
            onRecall={() => recallPreset(k)}
            onSave={() => savePreset(k)}
          />
        ))}
      </div>
    </section>
  )
}
