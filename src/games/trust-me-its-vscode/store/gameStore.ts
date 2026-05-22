import { create } from 'zustand'

export type Bug = {
  id: string
  x: number
  y: number
}

const COMBO_WINDOW_MS = 1500
const SCORE_PER_BUG = 10

type GameState = {
  bugs: Bug[]
  score: number
  combo: number
  lastKillAt: number
  spawnBug: () => void
  killBug: (id: string) => void
}

let bugCounter = 0
function nextBugId() {
  bugCounter += 1
  return `bug-${bugCounter}`
}

function randomCoord() {
  return 5 + Math.random() * 90
}

export const useGameStore = create<GameState>((set) => ({
  bugs: [],
  score: 0,
  combo: 0,
  lastKillAt: 0,
  spawnBug: () =>
    set((s) => ({
      bugs: [...s.bugs, { id: nextBugId(), x: randomCoord(), y: randomCoord() }],
    })),
  killBug: (id) =>
    set((s) => {
      const now = Date.now()
      const inCombo = now - s.lastKillAt <= COMBO_WINDOW_MS
      return {
        bugs: s.bugs.filter((b) => b.id !== id),
        score: s.score + SCORE_PER_BUG,
        combo: inCombo ? s.combo + 1 : 1,
        lastKillAt: now,
      }
    }),
}))
