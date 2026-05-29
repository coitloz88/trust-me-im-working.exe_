import '../styles/shell.css'
import { useShellStore } from '../store/shellStore'
import { DecoyEditor } from '../bosskey/DecoyEditor'
import { DecoyTerminal } from '../bosskey/DecoyTerminal'
import { MenuBar } from './MenuBar'
import { MouseTrail } from './MouseTrail'
import { Sidebar } from './Sidebar'
import { Tabs } from './Tabs'
import { EditorArea } from './EditorArea'
import { Terminal } from './Terminal'
import { StatusBar } from './StatusBar'

export function Shell() {
  const isDecoy = useShellStore((s) => s.isDecoy)

  return (
    <div className="shell">
      <MouseTrail />
      <MenuBar />
      <Sidebar />
      <div className="editor-column">
        <Tabs />
        {/* EditorArea/Terminal stay mounted in decoy mode so the active
            game keeps running (per PLAN §4 — boss key is background, not pause). */}
        <EditorArea hidden={isDecoy} />
        <Terminal hidden={isDecoy} />
        {isDecoy && <DecoyEditor />}
        {isDecoy && <DecoyTerminal />}
      </div>
      <StatusBar />
    </div>
  )
}
