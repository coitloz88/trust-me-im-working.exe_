import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

const BASE_DELAY_MS = 2000
const DELAY_REDUCTION_PER_LEVEL = 150
const MIN_DELAY_MS = 500
const JITTER_MS = 400

export function useSpawner() {
  const spawnBug = useGameStore((s) => s.spawnBug)
  const gameOver = useGameStore((s) => s.gameOver)
  const mazeIndex = useGameStore((s) => s.mazeIndex)

  useEffect(() => {
    if (gameOver) return
    const baseDelay = Math.max(MIN_DELAY_MS, BASE_DELAY_MS - mazeIndex * DELAY_REDUCTION_PER_LEVEL)
    let timer: number
    const tick = () => {
      const delay = baseDelay + (Math.random() - 0.5) * JITTER_MS
      timer = window.setTimeout(() => {
        spawnBug()
        tick()
      }, delay)
    }
    tick()
    return () => clearTimeout(timer)
  }, [spawnBug, gameOver, mazeIndex])
}
