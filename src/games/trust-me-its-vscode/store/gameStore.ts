import { create } from 'zustand'

type GameState = {
  hp: number
  distance: number   // meters (floor(distancePx / 10))
  score: number      // highest distance this run
  best: number       // all-time best distance
  gameOver: boolean
  generation: number // incremented on reset to trigger engine re-init

  setStats: (hp: number, distancePx: number, gameOver: boolean) => void
  reset: () => void
}

export const useGameStore = create<GameState>((set) => ({
  hp: 3,
  distance: 0,
  score: 0,
  best: 0,
  gameOver: false,
  generation: 0,

  setStats: (hp, distancePx, gameOver) => {
    const distance = Math.floor(distancePx / 10)
    set((s) => ({
      hp,
      distance,
      gameOver,
      score: Math.max(s.score, distance),
      best: Math.max(s.best, distance),
    }))
  },

  reset: () => set((s) => ({
    hp: 3,
    distance: 0,
    score: 0,
    gameOver: false,
    generation: s.generation + 1,
  })),
}))
