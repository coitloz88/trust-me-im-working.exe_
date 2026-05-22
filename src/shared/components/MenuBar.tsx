const MENU_ITEMS = [
  'File',
  'Edit',
  'Selection',
  'View',
  'Go',
  'Run',
  'Terminal',
  'Help',
]

export function MenuBar() {
  return (
    <div className="menubar">
      <span className="menubar__logo">≡</span>
      <div className="menubar__items">
        {MENU_ITEMS.map((item) => (
          <span key={item} className="menubar__item">
            {item}
          </span>
        ))}
      </div>
      <span className="menubar__title">
        oauth.service.ts — trust-me-im-working.exe_ — Visual Studio Code
      </span>
      <div className="menubar__window">
        <span className="menubar__window-btn">─</span>
        <span className="menubar__window-btn">▢</span>
        <span className="menubar__window-btn">✕</span>
      </div>
    </div>
  )
}
