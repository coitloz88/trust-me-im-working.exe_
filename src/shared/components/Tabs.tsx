import { useMatch } from 'react-router-dom'
import { gameRegistry } from '../../games/registry'
import { FileIcon } from './icons'
import { ShakyText } from './ShakyText'

export function Tabs() {
  const match = useMatch('/games/:gameId')
  const game = gameRegistry.find((g) => g.id === match?.params.gameId)

  return (
    <div className="tabs">
      {game && (
        <div className="tab tab--active" key={game.id}>
          <span className="tab__icon">
            <FileIcon />
          </span>
          <span><ShakyText text={game.fileName} /></span>
          <span className="tab__close">×</span>
        </div>
      )}
    </div>
  )
}
