import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

const MIN_DELAY_MS = 1000
const MAX_DELAY_MS = 2000

export function useSpawner() {
  const spawnBug = useGameStore((s) => s.spawnBug)

  useEffect(() => {
    let timer: number
    const tick = () => {
      const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
      timer = window.setTimeout(() => {
        spawnBug()
        tick()
      }, delay)
    }
    tick()
    return () => clearTimeout(timer)
  }, [spawnBug])
}
