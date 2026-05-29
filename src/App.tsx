import { HashRouter } from 'react-router-dom'
import { BossKeyProvider } from './shared/bosskey/BossKeyProvider'
import { Shell } from './shared/components/Shell'

function App() {
  return (
    <HashRouter>
      <BossKeyProvider>
        <Shell />
      </BossKeyProvider>
    </HashRouter>
  )
}

export default App
