import { useMatch } from 'react-router-dom'
import { gameRegistry } from '../../games/registry'

type Props = { hidden?: boolean }

export function EditorArea({ hidden }: Props) {
  const match = useMatch('/games/:gameId')
  const game = gameRegistry.find((g) => g.id === match?.params.gameId)

  const style = hidden ? { display: 'none' } : undefined

  if (game) {
    const GameComponent = game.component
    return (
      <div className="editor" style={style}>
        <GameComponent />
      </div>
    )
  }

  return (
    <div className="editor" style={style}>
      <div className="editor__placeholder">파일을 선택하세요</div>
    </div>
  )
}
