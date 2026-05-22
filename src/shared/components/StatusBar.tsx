export function StatusBar() {
  return (
    <div className="statusbar">
      <div className="statusbar__group">
        <span className="statusbar__item">⎇ main</span>
        <span className="statusbar__item">↑ 0 ↓ 0</span>
        <span className="statusbar__item">⊘ 0  ⚠ 0</span>
      </div>
      <div className="statusbar__group statusbar__group--right">
        <span className="statusbar__item">Ln 4, Col 9</span>
        <span className="statusbar__item">Spaces: 2</span>
        <span className="statusbar__item">UTF-8</span>
        <span className="statusbar__item">LF</span>
        <span className="statusbar__item">{'{} TypeScript'}</span>
        <span className="statusbar__item">⚡ Prettier</span>
      </div>
    </div>
  )
}
