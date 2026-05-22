type Tab = {
  icon: string
  label: string
  active?: boolean
  dirty?: boolean
}

const TABS: Tab[] = [
  { icon: '🟦', label: 'oauth.service.ts', active: true, dirty: true },
  { icon: '🟦', label: 'user.repository.ts' },
  { icon: '🟨', label: 'package.json' },
  { icon: '📘', label: 'README.md' },
]

export function Tabs() {
  return (
    <div className="tabs">
      {TABS.map((tab) => (
        <div
          key={tab.label}
          className={'tab' + (tab.active ? ' tab--active' : '')}
        >
          <span className="tab__icon">{tab.icon}</span>
          <span>{tab.label}</span>
          <span className="tab__close">{tab.dirty ? '●' : '×'}</span>
        </div>
      ))}
    </div>
  )
}
