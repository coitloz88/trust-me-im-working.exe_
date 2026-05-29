import { create } from 'zustand'

type ShellState = {
  isDecoy: boolean
  glitchLevel: number        // 0–1, drives ShakyText + MouseTrail intensity
  phantomFiles: string[]     // Sidebar phantom file names
  statusGlitch: boolean      // StatusBar shows cursed text
  toggleDecoy: () => void
  setGlitch: (level: number) => void
  setPhantomFiles: (files: string[]) => void
  setStatusGlitch: (v: boolean) => void
  resetGlitch: () => void
}

export const useShellStore = create<ShellState>((set) => ({
  isDecoy: false,
  glitchLevel: 0,
  phantomFiles: [],
  statusGlitch: false,
  toggleDecoy: () => set((s) => ({ isDecoy: !s.isDecoy })),
  setGlitch: (level) => set({ glitchLevel: level }),
  setPhantomFiles: (files) => set({ phantomFiles: files }),
  setStatusGlitch: (v) => set({ statusGlitch: v }),
  resetGlitch: () => set({ glitchLevel: 0, phantomFiles: [], statusGlitch: false }),
}))
