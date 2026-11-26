import { useTranslation } from 'react-i18next'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useRadio } from '@/pages/Radio/RadioProvider'
import { useKeyboardShortcuts } from '@/pages/Radio/useKeyboardShortcuts'
import Toast from '@/components/Toast'
import Header from './sections/header'
import Wheel from './sections/wheel'
import ControlPanel from './sections/controlPanel'
import StartScreen from './sections/startScreen'

export default function Radio() {
  const { t } = useTranslation()
  const { toastMsg, currentStation } = useRadio()
  const isDesktop = useIsDesktop()
  useKeyboardShortcuts()

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed -inset-[20%] blur-[60px] transition-opacity duration-700 ${currentStation ? 'opacity-55' : 'opacity-15'}`}
        style={{
          background: 'radial-gradient(40% 40% at 30% 35%, color-mix(in srgb, var(--c1) 45%, transparent), transparent 70%), radial-gradient(45% 45% at 70% 70%, color-mix(in srgb, var(--c2) 40%, transparent), transparent 70%)',
        }}
      />
      <Header />
      <main className={`relative flex min-h-0 flex-1 ${isDesktop ? 'gap-8 px-8 pb-6' : 'flex-col pb-[150px]'}`}>
        <div className={`relative min-h-0 min-w-0 flex-1 overflow-hidden ${isDesktop ? '' : 'mt-1'}`}>
          <Wheel key={isDesktop ? 'full' : 'dial'} variant={isDesktop ? 'full' : 'dial'} />
        </div>
        <ControlPanel isDesktop={isDesktop} />
        {isDesktop && (
          <p className="pointer-events-none absolute bottom-2 end-8 m-0 w-[400px] text-center text-xs text-muted">{t('controls.keyboard')}</p>
        )}
      </main>
      <Toast toast={toastMsg} />
      <StartScreen />
    </div>
  )
}
