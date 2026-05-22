import { useGameStore } from '../store/gameStore'

type Props = {
  id: string
  x: number
  y: number
}

export function Bug({ id, x, y }: Props) {
  const killBug = useGameStore((s) => s.killBug)
  return (
    <span
      onClick={() => killBug(id)}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        fontSize: 20,
        lineHeight: 1,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      🐛
    </span>
  )
}
