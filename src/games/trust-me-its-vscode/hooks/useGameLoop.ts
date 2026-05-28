import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'

export function useGameLoop() {
  const tick = useGameStore((s) => s.tick)
  const gameOver = useGameStore((s) => s.gameOver)
  const rafRef = useRef<number>(0)
  const lastRef = useRef<number>(0)

  useEffect(() => {
    if (gameOver) return
    lastRef.current = 0
    const loop = (ts: number) => {
      const dt = lastRef.current ? Math.min((ts - lastRef.current) / 1000, 0.1) : 0
      lastRef.current = ts
      tick(dt)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick, gameOver])
}
