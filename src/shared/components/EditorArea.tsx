import { useMatch } from 'react-router-dom'
import { gameRegistry } from '../../games/registry'

export function EditorArea() {
  const match = useMatch('/games/:gameId')
  const game = gameRegistry.find((g) => g.id === match?.params.gameId)

  if (game) {
    const GameComponent = game.component
    return (
      <div className="editor">
        <GameComponent />
      </div>
    )
  }

  return (
    <div className="editor">
      <div className="editor__placeholder">파일을 선택하세요</div>
    </div>
  )
}
