import { useEffect, useRef } from 'react'
import { useBackroomsStore } from './store/backroomsStore'
import { useShellStore } from '../../shared/store/shellStore'
import { useBackroomsClock } from './hooks/useBackroomsClock'
import { CodeEditor } from './components/CodeEditor'
import { FallingLetters } from './components/FallingLetters'
import './styles.css'

function resetCssVars() {
  const KEYS = [
    '--vsc-bg-editor', '--vsc-bg-sidebar', '--vsc-bg-activitybar',
    '--vsc-bg-titlebar', '--vsc-bg-tabs', '--vsc-bg-panel',
    '--vsc-bg-panel-header', '--vsc-bg-statusbar', '--vsc-fg', '--vsc-fg-muted',
  ]
  KEYS.forEach((k) => document.documentElement.style.removeProperty(k))
}

export function Backrooms() {
  const flickerRef = useRef<HTMLDivElement>(null)

  const reset       = useBackroomsStore((s) => s.reset)
  const phase       = useBackroomsStore((s) => s.phase)
  const elapsed     = useBackroomsStore((s) => s.elapsed)
  const escaped     = useBackroomsStore((s) => s.escaped)
  const resetGlitch = useShellStore((s) => s.resetGlitch)

  // Fresh start on every mount
  useEffect(() => {
    reset()
    return () => {
      resetCssVars()
      resetGlitch()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useBackroomsClock({ flickerRef })

  const whiteOpacity =
    phase === 4 ? Math.min(1, (elapsed - 28) / 2) :
    phase >= 5  ? 1 : 0

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        overflow: 'hidden',
        background: 'var(--vsc-bg-editor)',
        fontFamily: 'var(--vsc-font-mono)',
      }}
    >
      <CodeEditor />
      <FallingLetters />

      {/* Fluorescent flicker overlay */}
      <div
        ref={flickerRef}
        className="backrooms-flicker"
        style={{ opacity: 0 }}
      />

      {/* White fade-out (phase 4+) */}
      {whiteOpacity > 0 && (
        <div
          className="backrooms-whiteout"
          style={{ opacity: whiteOpacity }}
        />
      )}

      {/* Phase 5: "you are here" hint */}
      {phase >= 5 && !escaped && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            color: '#bbb',
            fontFamily: 'monospace',
            fontSize: 12,
            userSelect: 'none',
          }}
        >
          // check the terminal
        </div>
      )}
    </div>
  )
}
