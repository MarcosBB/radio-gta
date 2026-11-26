import { RadioProvider } from '@/pages/Radio/RadioProvider'
import Radio from '@/pages/Radio'

export default function App() {
  return (
    <RadioProvider>
      <Radio />
    </RadioProvider>
  )
}
