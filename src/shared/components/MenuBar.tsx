import { useEffect, useState } from 'react'
import { ShakyText } from './ShakyText'
import { useShellStore } from '../store/shellStore'

const MENU_ITEMS = ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help']

type DropdownEntry = { label: string; shortcut?: string } | null  // null = separator

const DROPDOWN_ITEMS: Record<string, DropdownEntry[]> = {
  File: [
    { label: 'New File',          shortcut: 'Ctrl+N' },
    { label: 'New Window',        shortcut: 'Ctrl+Shift+N' },
    null,
    { label: 'Open Folder...',    shortcut: 'Ctrl+K Ctrl+O' },
    { label: 'Open Recent...' },
    null,
    { label: 'Save',              shortcut: 'Ctrl+S' },
    { label: 'Save As...',        shortcut: 'Ctrl+Shift+S' },
    null,
    { label: 'Close Editor',      shortcut: 'Ctrl+W' },
  ],
  Edit: [
    { label: 'Undo',    shortcut: 'Ctrl+Z' },
    { label: 'Redo',    shortcut: 'Ctrl+Y' },
    null,
    { label: 'Cut',     shortcut: 'Ctrl+X' },
    { label: 'Copy',    shortcut: 'Ctrl+C' },
    { label: 'Paste',   shortcut: 'Ctrl+V' },
    null,
    { label: 'Find',    shortcut: 'Ctrl+F' },
    { label: 'Replace', shortcut: 'Ctrl+H' },
  ],
  Selection: [
    { label: 'Select All',          shortcut: 'Ctrl+A' },
    { label: 'Expand Selection',    shortcut: 'Shift+Alt+→' },
    { label: 'Shrink Selection',    shortcut: 'Shift+Alt+←' },
    null,
    { label: 'Add Cursor Above',    shortcut: 'Ctrl+Alt+↑' },
    { label: 'Add Cursor Below',    shortcut: 'Ctrl+Alt+↓' },
  ],
  View: [
    { label: 'Command Palette...', shortcut: 'Ctrl+Shift+P' },
    null,
    { label: 'Explorer',           shortcut: 'Ctrl+Shift+E' },
    { label: 'Search',             shortcut: 'Ctrl+Shift+F' },
    { label: 'Source Control',     shortcut: 'Ctrl+Shift+G' },
    null,
    { label: 'Terminal',           shortcut: 'Ctrl+`' },
    { label: 'Problems',           shortcut: 'Ctrl+Shift+M' },
  ],
  Go: [
    { label: 'Back',                 shortcut: 'Alt+←' },
    { label: 'Forward',              shortcut: 'Alt+→' },
    null,
    { label: 'Go to File...',        shortcut: 'Ctrl+P' },
    { label: 'Go to Symbol...',      shortcut: 'Ctrl+Shift+O' },
    null,
    { label: 'Go to Line/Column...', shortcut: 'Ctrl+G' },
  ],
  Run: [
    { label: 'Start Debugging',         shortcut: 'F5' },
    { label: 'Run Without Debugging',   shortcut: 'Ctrl+F5' },
    { label: 'Stop Debugging',          shortcut: 'Shift+F5' },
    null,
    { label: 'Add Configuration...' },
  ],
  Terminal: [
    { label: 'New Terminal',   shortcut: 'Ctrl+Shift+`' },
    { label: 'Split Terminal', shortcut: 'Ctrl+Shift+5' },
    null,
    { label: 'Run Task...' },
    { label: 'Run Build Task...', shortcut: 'Ctrl+Shift+B' },
    null,
    { label: 'Clear' },
  ],
  Help: [
    { label: 'Welcome' },
    { label: 'Get Started' },
    { label: 'Documentation' },
    null,
    { label: 'Check for Updates...' },
    null,
    { label: 'About' },
  ],
}

export function MenuBar() {
  const glitchLevel = useShellStore((s) => s.glitchLevel)
  const isDecoy     = useShellStore((s) => s.isDecoy)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [highlighted, setHighlighted] = useState<number>(-1)

  useEffect(() => {
    if (glitchLevel < 0.1 || isDecoy) {
      setOpenMenu(null)
      return
    }

    let active = true

    const schedule = () => {
      if (!active) return
      // 높은 glitchLevel일수록 더 자주 열림
      const delay = 400 + Math.random() * (2500 / glitchLevel)
      const timer = window.setTimeout(() => {
        if (!active) return
        const item = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)]
        setOpenMenu(item)

        const entries = DROPDOWN_ITEMS[item]?.filter(Boolean) ?? []
        if (entries.length > 0) {
          setHighlighted(Math.floor(Math.random() * entries.length))
        }

        // 잠깐 열려있다가 닫힘
        const openDuration = 200 + Math.random() * 700
        window.setTimeout(() => {
          if (!active) return
          setOpenMenu(null)
          setHighlighted(-1)
          schedule()
        }, openDuration)
      }, delay)

      return () => window.clearTimeout(timer)
    }

    const cleanup = schedule()
    return () => { active = false; setOpenMenu(null); cleanup?.() }
  }, [glitchLevel, isDecoy])

  return (
    <div className="menubar">
      <span className="menubar__logo">≡</span>
      <div className="menubar__items">
        {MENU_ITEMS.map((item) => (
          <span
            key={item}
            className={'menubar__item' + (openMenu === item ? ' menubar__item--open' : '')}
          >
            <ShakyText text={item} />
            {openMenu === item && (
              <div className="menubar__dropdown">
                {(DROPDOWN_ITEMS[item] ?? []).map((entry, i) =>
                  entry === null ? (
                    <div key={i} className="menubar__dropdown-sep" />
                  ) : (
                    <div
                      key={i}
                      className={
                        'menubar__dropdown-item' +
                        (i === highlighted ? ' menubar__dropdown-item--active' : '')
                      }
                    >
                      <span>{entry.label}</span>
                      {entry.shortcut && (
                        <span className="menubar__dropdown-shortcut">{entry.shortcut}</span>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </span>
        ))}
      </div>
      <span className="menubar__title">
        <ShakyText text="oauth.service.ts — trust-me-im-working.exe_ — Visual Studio Code" />
      </span>
      <div className="menubar__window">
        <span className="menubar__window-btn">─</span>
        <span className="menubar__window-btn">▢</span>
        <span className="menubar__window-btn">✕</span>
      </div>
    </div>
  )
}
