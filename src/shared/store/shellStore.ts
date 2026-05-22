import { create } from 'zustand'

type ShellState = {
  isDecoy: boolean
  toggleDecoy: () => void
}

export const useShellStore = create<ShellState>((set) => ({
  isDecoy: false,
  toggleDecoy: () => set((s) => ({ isDecoy: !s.isDecoy })),
}))
