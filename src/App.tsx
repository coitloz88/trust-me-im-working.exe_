import { BrowserRouter } from 'react-router-dom'
import { BossKeyProvider } from './shared/bosskey/BossKeyProvider'
import { Shell } from './shared/components/Shell'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <BossKeyProvider>
        <Shell />
      </BossKeyProvider>
    </BrowserRouter>
  )
}

export default App
