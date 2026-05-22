import { BossKeyProvider } from './shared/bosskey/BossKeyProvider'
import { Shell } from './shared/components/Shell'

function App() {
  return (
    <BossKeyProvider>
      <Shell />
    </BossKeyProvider>
  )
}

export default App
