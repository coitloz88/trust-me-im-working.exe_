import { useEffect, useRef, useState } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { useGameStore } from '../../games/trust-me-its-vscode/store/gameStore'
import { useBackroomsStore } from '../../games/backrooms/store/backroomsStore'
import { useShellStore } from '../store/shellStore'

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
  const bodyRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const match  = useMatch('/games/:gameId')
  const gameId = match?.params.gameId
  const isVscode    = gameId === 'trust-me-its-vscode'
  const isBackrooms = gameId === 'backrooms'

  // ── runner game state ─────────────────────────────────────
  const gameOver    = useGameStore((s) => s.gameOver)
  const distance    = useGameStore((s) => s.distance)
  const best        = useGameStore((s) => s.best)
  const runnerReset = useGameStore((s) => s.reset)

  // ── backrooms state ───────────────────────────────────────
  const backPhase   = useBackroomsStore((s) => s.phase)
  const backEscape  = useBackroomsStore((s) => s.escape)
  const backReset   = useBackroomsStore((s) => s.reset)
  const resetGlitch = useShellStore((s) => s.resetGlitch)
  const showBackroomsEscape = isBackrooms && backPhase >= 5

  // Focus + scroll when relevant prompts appear
  useEffect(() => {
    if (isVscode && gameOver) {
      inputRef.current?.focus()
      setTimeout(() => {
        bodyRef.current && (bodyRef.current.scrollTop = bodyRef.current.scrollHeight)
      }, 0)
    }
  }, [isVscode, gameOver])

  useEffect(() => {
    if (showBackroomsEscape) {
      inputRef.current?.focus()
      setTimeout(() => {
        bodyRef.current && (bodyRef.current.scrollTop = bodyRef.current.scrollHeight)
      }, 0)
    }
  }, [showBackroomsEscape])

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !cmd.trim()) return

    if (isVscode && gameOver) {
      runnerReset()
    } else if (showBackroomsEscape) {
      backEscape()
      backReset()
      resetGlitch()
      navigate('/')
    }
    setCmd('')
  }

  // ── Render ────────────────────────────────────────────────
  const hideBootLines = showBackroomsEscape

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
        {!hideBootLines && BOOT_LINES.map((line, i) => (
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

        {/* Runner game log */}
        {isVscode && !gameOver && (
          <div className="terminal__line">
            <span style={{ color: 'var(--vsc-fg-muted)' }}>
              [INFO] runner active · press Space / ↑ / W to jump
            </span>
          </div>
        )}

        {isVscode && gameOver && (
          <>
            <div className="terminal__line">
              <span style={{ color: 'var(--vsc-accent-red)' }}>[ERROR] UnhandledRejection: cursor fell out of scope</span>
            </div>
            <div className="terminal__line">
              <span style={{ color: 'var(--vsc-accent-red)' }}>[FATAL] Process exited · hp depleted · exit code 1</span>
            </div>
            <div className="terminal__line">
              <span style={{ color: 'var(--vsc-fg-muted)' }}>
                [INFO]  distance: {distance}m  ·  best: {best}m
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
                style={inputStyle}
              />
            </div>
          </>
        )}

        {/* Backrooms escape prompt */}
        {showBackroomsEscape && (
          <>
            <div className="terminal__line">
              <span style={{ color: 'var(--vsc-fg-muted)' }}>[SYSTEM] connection lost</span>
            </div>
            <div className="terminal__line"><span> </span></div>
            <div className="terminal__line">
              <span className="terminal__path">PS C:\dev\backrooms&gt; </span>
              <input
                ref={inputRef}
                value={cmd}
                onChange={(e) => setCmd(e.target.value)}
                onKeyDown={handleKey}
                placeholder="exit"
                style={inputStyle}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'var(--vsc-fg)',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  width: 220,
  caretColor: 'var(--vsc-fg)',
}
