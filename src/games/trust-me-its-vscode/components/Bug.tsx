type Props = { x: number; y: number }

export function Bug({ x, y }: Props) {
  return (
    <span
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        fontSize: 30,
        lineHeight: 1,
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      🐛
    </span>
  )
}
