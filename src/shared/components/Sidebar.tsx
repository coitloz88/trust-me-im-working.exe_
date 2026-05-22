import type { ReactNode } from 'react'

type TreeNode = {
  label: string
  icon: string
  type: 'folder' | 'file'
  depth: number
  open?: boolean
  active?: boolean
}

type ActivityIcon = {
  id: string
  label: string
  render: () => ReactNode
  active?: boolean
}

const svgProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const ACTIVITY_ICONS: ActivityIcon[] = [
  {
    id: 'explorer',
    label: 'Explorer',
    active: true,
    render: () => (
      <svg {...svgProps}>
        <path d="M3 5h6l2 2h10v12H3z" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
  {
    id: 'search',
    label: 'Search',
    render: () => (
      <svg {...svgProps}>
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path d="M15 15l5 5" />
      </svg>
    ),
  },
  {
    id: 'scm',
    label: 'Source Control',
    render: () => (
      <svg {...svgProps}>
        <circle cx="7" cy="6" r="2" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="10" r="2" />
        <path d="M7 8v8" />
        <path d="M7 13c0-2 3-3 8-3" />
      </svg>
    ),
  },
  {
    id: 'run',
    label: 'Run and Debug',
    render: () => (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M10 8.5l6 3.5-6 3.5z" />
      </svg>
    ),
  },
  {
    id: 'extensions',
    label: 'Extensions',
    render: () => (
      <svg {...svgProps}>
        <rect x="4" y="4" width="7" height="7" />
        <rect x="13" y="4" width="7" height="7" />
        <rect x="4" y="13" width="7" height="7" />
        <path d="M14 14h6v6h-6z" strokeDasharray="2.5 2" />
      </svg>
    ),
  },
]

const TREE: TreeNode[] = [
  { label: 'trust-me-im-working.exe_', icon: '📂', type: 'folder', depth: 0, open: true },
  { label: 'src', icon: '📂', type: 'folder', depth: 1, open: true },
  { label: 'auth', icon: '📂', type: 'folder', depth: 2, open: true },
  { label: 'oauth.service.ts', icon: '🟦', type: 'file', depth: 3, active: true },
  { label: 'jwt.middleware.ts', icon: '🟦', type: 'file', depth: 3 },
  { label: 'session.store.ts', icon: '🟦', type: 'file', depth: 3 },
  { label: 'users', icon: '📁', type: 'folder', depth: 2 },
  { label: 'api', icon: '📁', type: 'folder', depth: 2 },
  { label: 'hooks', icon: '📁', type: 'folder', depth: 2 },
  { label: 'components', icon: '📁', type: 'folder', depth: 2 },
  { label: 'utils', icon: '📁', type: 'folder', depth: 2 },
  { label: 'db', icon: '📁', type: 'folder', depth: 2 },
  { label: 'infra', icon: '📁', type: 'folder', depth: 2 },
  { label: 'package.json', icon: '🟨', type: 'file', depth: 1 },
  { label: 'tsconfig.json', icon: '🟦', type: 'file', depth: 1 },
  { label: 'README.md', icon: '📘', type: 'file', depth: 1 },
]

function ActivityBar() {
  return (
    <div className="activitybar">
      {ACTIVITY_ICONS.map((item) => (
        <div
          key={item.id}
          className={
            'activitybar__icon' +
            (item.active ? ' activitybar__icon--active' : '')
          }
          title={item.label}
        >
          {item.render()}
        </div>
      ))}
    </div>
  )
}

function Tree() {
  return (
    <div className="sidebar__tree">
      <div className="sidebar__section-title">trust-me-im-working.exe_</div>
      {TREE.slice(1).map((node, i) => (
        <div
          key={i}
          className={'tree__node' + (node.active ? ' tree__node--active' : '')}
          style={{ paddingLeft: 8 + (node.depth - 1) * 12 }}
        >
          <span
            className={
              'tree__chevron' +
              (node.type === 'file' ? ' tree__chevron--empty' : '')
            }
          >
            {node.type === 'folder' ? (node.open ? '▾' : '▸') : ''}
          </span>
          <span className="tree__icon">{node.icon}</span>
          <span className="tree__label">{node.label}</span>
        </div>
      ))}
    </div>
  )
}

export function Sidebar() {
  return (
    <>
      <ActivityBar />
      <div className="sidebar">
        <div className="sidebar__header">Explorer</div>
        <Tree />
      </div>
    </>
  )
}
