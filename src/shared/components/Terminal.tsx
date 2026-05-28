import { useEffect, useRef, useState } from 'react'
import { useMatch } from 'react-router-dom'
import { useGameStore } from '../../games/trust-me-its-vscode/store/gameStore'

const PANEL_TABS = ['Problems', 'Output', 'Debug Console', 'Terminal', 'Ports']

const BOOT_LINES = [
  { prompt: true, text: 'pnpm dev' },
  { text: '' },
  { text: '> trust-me-im-working.exe_@0.0.0 dev' },
  { text: '> vite' },
  { text: '' },
  { text: '  VITE v8.0.12  ready in 423 ms' },
  { text: '' },
  { text: '  ➜  Local:   http://localhost:5173/' },
  { text: '  ➜  Network: use --host to expose' },
  { text: '  ➜  press h + enter to show help' },
]

type Props = { hidden?: boolean }

export function Terminal({ hidden }: Props) {
  const [cmd, setCmd] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const match = useMatch('/games/:gameId')
  const isVscode = match?.params.gameId === 'trust-me-its-vscode'

  const gameOver = useGameStore((s) => s.gameOver)
  const maze = useGameStore((s) => s.maze)
  const mazeIndex = useGameStore((s) => s.mazeIndex)
  const reset = useGameStore((s) => s.reset)

  // Focus input and scroll to bottom when game over
  useEffect(() => {
    if (!isVscode || !gameOver) return
    inputRef.current?.focus()
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [isVscode, gameOver])

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && cmd.trim()) {
      reset()
      setCmd('')
    }
  }

  return (
    <div className="terminal" style={hidden ? { display: 'none' } : undefined}>
      <div className="terminal__header">
        {PANEL_TABS.map((tab, i) => (
          <div
            key={tab}
            className={'terminal__tab' + (i === 3 ? ' terminal__tab--active' : '')}
          >
            {tab}
          </div>
        ))}
      </div>
      <div className="terminal__body" ref={bodyRef}>
        {BOOT_LINES.map((line, i) => (
          <div key={i} className="terminal__line">
            {line.prompt ? (
              <>
                <span className="terminal__path">PS C:\dev\trust-me&gt; </span>
                <span>{line.text}</span>
              </>
            ) : (
              <span>{line.text || ' '}</span>
            )}
          </div>
        ))}

        {isVscode && (
          <>
            <div className="terminal__line">
              <span style={{ color: 'var(--vsc-fg-muted)' }}>
                [LOAD] ./src/games/trust-me-its-vscode/{maze.name}
              </span>
            </div>
            <div className="terminal__line">
              <span style={{ color: 'var(--vsc-fg-muted)' }}>
                [WARN] BugSpawner: active · level {mazeIndex + 1} / {3}
              </span>
            </div>
          </>
        )}

        {isVscode && gameOver && (
          <>
            <div className="terminal__line">
              <span style={{ color: 'var(--vsc-accent-red)' }}>
                [ERROR] Uncaught BugException: cursor collision detected
              </span>
            </div>
            <div className="terminal__line">
              <span style={{ color: 'var(--vsc-accent-red)' }}>
                [FATAL] Process terminated · exit code 1
              </span>
            </div>
            <div className="terminal__line"><span> </span></div>
            <div className="terminal__line">
              <span className="terminal__path">PS C:\dev\trust-me&gt; </span>
              <input
                ref={inputRef}
                value={cmd}
                onChange={(e) => setCmd(e.target.value)}
                onKeyDown={handleKey}
                placeholder="npm run restart"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--vsc-fg)',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  width: 220,
                  caretColor: 'var(--vsc-fg)',
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
