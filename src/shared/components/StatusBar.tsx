import { useMatch } from 'react-router-dom'
import { useShellStore } from '../store/shellStore'
// trust-me-its-vscode 전용 의존. 두 번째 게임이 들어오면 registry 측에
// "useGameStatusItems" 같은 hook을 노출하도록 추상화 (PLAN v0.3).
import { useGameStore } from '../../games/trust-me-its-vscode/store/gameStore'

export function StatusBar() {
  const isDecoy = useShellStore((s) => s.isDecoy)
  const match = useMatch('/games/:gameId')
  const showGameStatus =
    !isDecoy && match?.params.gameId === 'trust-me-its-vscode'

  const score = useGameStore((s) => s.score)
  const combo = useGameStore((s) => s.combo)

  return (
    <div className="statusbar">
      <div className="statusbar__group">
        <span className="statusbar__item">⎇ main</span>
        <span className="statusbar__item">↑ 0 ↓ 0</span>
        <span className="statusbar__item">⊘ 0  ⚠ 0</span>
        {showGameStatus && (
          <>
            <span className="statusbar__item">Combo: x{combo}</span>
            <span className="statusbar__item">
              ▲ {score.toLocaleString()} LOC today
            </span>
          </>
        )}
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
