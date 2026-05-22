import { Bug } from './components/Bug'
import { useSpawner } from './hooks/useSpawner'
import { useGameStore } from './store/gameStore'

export function TrustMeItsVscode() {
  useSpawner()
  const bugs = useGameStore((s) => s.bugs)

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        overflow: 'hidden',
      }}
    >
      {bugs.map((b) => (
        <Bug key={b.id} id={b.id} x={b.x} y={b.y} />
      ))}
    </div>
  )
}
