import '../styles/shell.css'
import { MenuBar } from './MenuBar'
import { Sidebar } from './Sidebar'
import { Tabs } from './Tabs'
import { EditorArea } from './EditorArea'
import { Terminal } from './Terminal'
import { StatusBar } from './StatusBar'

export function Shell() {
  return (
    <div className="shell">
      <MenuBar />
      <Sidebar />
      <div className="editor-column">
        <Tabs />
        <EditorArea />
        <Terminal />
      </div>
      <StatusBar />
    </div>
  )
}
