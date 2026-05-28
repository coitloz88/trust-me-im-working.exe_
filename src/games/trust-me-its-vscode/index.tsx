import { useRef } from 'react'
import { Bug } from './components/Bug'
import { Maze } from './components/Maze'
import { Player } from './components/Player'
import { useGameLoop } from './hooks/useGameLoop'
import { useSpawner } from './hooks/useSpawner'
import { useGameStore } from './store/gameStore'

export function TrustMeItsVscode() {
  useGameLoop()
  useSpawner()

  const containerRef = useRef<HTMLDivElement>(null)
  const maze = useGameStore((s) => s.maze)
  const bugs = useGameStore((s) => s.bugs)
  const playerX = useGameStore((s) => s.playerX)
  const playerY = useGameStore((s) => s.playerY)
  const gameOver = useGameStore((s) => s.gameOver)
  const setPlayerPos = useGameStore((s) => s.setPlayerPos)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    // Guard against decoy mode (display:none → width/height = 0)
    if (rect.width === 0 || rect.height === 0) return
    setPlayerPos(
      Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    )
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        flex: 1,
        overflow: 'hidden',
        cursor: gameOver ? 'default' : 'none',
        background: 'var(--vsc-bg-editor)',
      }}
    >
      <Maze maze={maze} />
      {bugs.map((b) => (
        <Bug key={b.id} x={b.x} y={b.y} />
      ))}
      <Player x={playerX} y={playerY} />
      {gameOver && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
