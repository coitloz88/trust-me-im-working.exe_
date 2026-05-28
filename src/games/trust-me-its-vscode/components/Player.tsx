import { useGameStore } from '../store/gameStore'

type Props = { x: number; y: number }

export function Player({ x, y }: Props) {
  const invulnUntil = useGameStore((s) => s.invulnUntil)
  const isHit = Date.now() < invulnUntil

  return (
    <span
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        display: 'inline-block',
        width: 2,
        height: 20,
        background: isHit ? 'var(--vsc-accent-red)' : 'var(--vsc-fg)',
        boxShadow: isHit ? '0 0 8px var(--vsc-accent-red)' : '0 0 6px #aeafad44',
        pointerEvents: 'none',
        transition: 'background 0.05s, box-shadow 0.05s',
      }}
    />
  )
}
