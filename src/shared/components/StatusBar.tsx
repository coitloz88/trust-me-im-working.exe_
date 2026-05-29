import { useMemo } from 'react'
import { useMatch } from 'react-router-dom'
import { useShellStore } from '../store/shellStore'
import { useGameStore } from '../../games/trust-me-its-vscode/store/gameStore'

const GLITCH_OPTIONS = {
  branch:    ['⎇ no clip', '⎇ level_0', '⎇ ∞'],
  errors:    '⊘ ∞  ⚠ ∞',
  ln:        'Ln ∞, Col ?',
  encoding:  ['ERR_BOM_LOST', 'ERR_ENCODING', '????'],
  eol:       '??',
  lang:      '{} ████████',
  formatter: '⚡ entity_seen',
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

export function StatusBar() {
  const isDecoy       = useShellStore((s) => s.isDecoy)
  const statusGlitch  = useShellStore((s) => s.statusGlitch)
  const match = useMatch('/games/:gameId')
  const gameId = match?.params.gameId
  const showRunnerStatus = !isDecoy && gameId === 'trust-me-its-vscode'

  const hp           = useGameStore((s) => s.hp)
  const distance     = useGameStore((s) => s.distance)

  // Decide glitch texts once per glitch session (stable via useMemo on statusGlitch)
  const glitch = useMemo(() => {
    if (!statusGlitch) return null
    return {
      branch:    pick(GLITCH_OPTIONS.branch),
      errors:    GLITCH_OPTIONS.errors,
      ln:        GLITCH_OPTIONS.ln,
      encoding:  pick(GLITCH_OPTIONS.encoding),
      eol:       GLITCH_OPTIONS.eol,
      lang:      GLITCH_OPTIONS.lang,
      formatter: GLITCH_OPTIONS.formatter,
    }
  }, [statusGlitch])

  const showGlitch = statusGlitch && !isDecoy && !!glitch

  return (
    <div className="statusbar">
      <div className="statusbar__group">
        <span className="statusbar__item">{showGlitch ? glitch!.branch : '⎇ main'}</span>
        <span className="statusbar__item">{showGlitch ? '↑ ? ↓ ?' : '↑ 0 ↓ 0'}</span>
        <span className="statusbar__item">{showGlitch ? glitch!.errors : '⊘ 0  ⚠ 0'}</span>
        {showRunnerStatus && (
          <>
            <span className="statusbar__item">{'♥'.repeat(Math.max(0, hp))}{'♡'.repeat(Math.max(0, 3 - hp))}</span>
            <span className="statusbar__item">⏱ {distance}m</span>
          </>
        )}
      </div>
      <div className="statusbar__group statusbar__group--right">
        <span className="statusbar__item">{showGlitch ? glitch!.ln : 'Ln 4, Col 9'}</span>
        <span className="statusbar__item">Spaces: 2</span>
        <span className="statusbar__item">{showGlitch ? glitch!.encoding : 'UTF-8'}</span>
        <span className="statusbar__item">{showGlitch ? glitch!.eol : 'LF'}</span>
        <span className="statusbar__item">{showGlitch ? glitch!.lang : '{} TypeScript'}</span>
        <span className="statusbar__item">{showGlitch ? glitch!.formatter : '⚡ Prettier'}</span>
      </div>
    </div>
  )
}
