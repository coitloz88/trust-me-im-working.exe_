import { create } from 'zustand'

export type BackroomsPhase = 0 | 1 | 2 | 3 | 4 | 5

function phaseFor(elapsed: number): BackroomsPhase {
  if (elapsed >= 30) return 5
  if (elapsed >= 28) return 4
  if (elapsed >= 22) return 3
  if (elapsed >= 12) return 2
  if (elapsed >= 5)  return 1
  return 0
}

type BackroomsState = {
  phase: BackroomsPhase
  elapsed: number
  escaped: boolean
  tick: (dt: number) => void
  reset: () => void
  escape: () => void
}

export const useBackroomsStore = create<BackroomsState>((set) => ({
  phase: 0,
  elapsed: 0,
  escaped: false,

  tick: (dt) =>
    set((s) => {
      if (s.escaped) return {}
      const newElapsed = s.elapsed + dt
      return { elapsed: newElapsed, phase: phaseFor(newElapsed) }
    }),

  reset: () => set({ phase: 0, elapsed: 0, escaped: false }),
  escape: () => set({ escaped: true }),
}))
