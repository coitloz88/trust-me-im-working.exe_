import '../styles/shell.css'
import { useShellStore } from '../store/shellStore'
import { DecoyEditor } from '../bosskey/DecoyEditor'
import { DecoyTerminal } from '../bosskey/DecoyTerminal'
import { MenuBar } from './MenuBar'
import { Sidebar } from './Sidebar'
import { Tabs } from './Tabs'
import { EditorArea } from './EditorArea'
import { Terminal } from './Terminal'
import { StatusBar } from './StatusBar'

export function Shell() {
  const isDecoy = useShellStore((s) => s.isDecoy)

  return (
    <div className="shell">
      <MenuBar />
      <Sidebar />
      <div className="editor-column">
        <Tabs />
        {isDecoy ? <DecoyEditor /> : <EditorArea />}
        {isDecoy ? <DecoyTerminal /> : <Terminal />}
      </div>
      <StatusBar />
    </div>
  )
}
