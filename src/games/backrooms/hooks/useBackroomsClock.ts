import { useEffect, useRef } from 'react'
import { useBackroomsStore } from '../store/backroomsStore'
import { useShellStore } from '../../../shared/store/shellStore'

// ─── Color interpolation ────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function lerp(a: number, b: number, t: number) { return Math.round(a + (b - a) * t) }

function lerpColor(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from)
  const [r2, g2, b2] = hexToRgb(to)
  return `rgb(${lerp(r1,r2,t)},${lerp(g1,g2,t)},${lerp(b1,b2,t)})`
}

const DARK_PALETTE: Record<string, string> = {
  '--vsc-bg-editor':       '#1e1e1e',
  '--vsc-bg-sidebar':      '#252526',
  '--vsc-bg-activitybar':  '#333333',
  '--vsc-bg-titlebar':     '#3c3c3c',
  '--vsc-bg-tabs':         '#2d2d2d',
  '--vsc-bg-panel':        '#1e1e1e',
  '--vsc-bg-panel-header': '#252526',
  '--vsc-bg-statusbar':    '#007acc',
  '--vsc-fg':              '#cccccc',
  '--vsc-fg-muted':        '#858585',
}

const LIGHT_PALETTE: Record<string, string> = {
  '--vsc-bg-editor':       '#f4ecc8',
  '--vsc-bg-sidebar':      '#d8c89a',
  '--vsc-bg-activitybar':  '#b8a07a',
  '--vsc-bg-titlebar':     '#c4b07a',
  '--vsc-bg-tabs':         '#c4b07a',
  '--vsc-bg-panel':        '#ede4c0',
  '--vsc-bg-panel-header': '#d8c89a',
  '--vsc-bg-statusbar':    '#6b4818',
  '--vsc-fg':              '#3a2a0a',
  '--vsc-fg-muted':        '#6b4818',
}

function applyPalette(t: number) {
  const el = document.documentElement
  Object.keys(DARK_PALETTE).forEach((k) =>
    el.style.setProperty(k, lerpColor(DARK_PALETTE[k], LIGHT_PALETTE[k], t)),
  )
}

// ─── Hook ───────────────────────────────────────────────────────────────────

const PHANTOM_POOL = [
  'level_0.txt', 'noclip.tsx', 'almond_water.json',
  'exit.???', 'REDACTED', 'you_are_here', '∞.ts', '████████.ts',
]

type Props = {
  flickerRef: React.RefObject<HTMLDivElement | null>
}

export function useBackroomsClock({ flickerRef }: Props) {
  const tick     = useBackroomsStore((s) => s.tick)
  const phase    = useBackroomsStore((s) => s.phase)
  const escaped  = useBackroomsStore((s) => s.escaped)
  const isDecoy  = useShellStore((s) => s.isDecoy)
  const setGlitch       = useShellStore((s) => s.setGlitch)
  const setPhantomFiles = useShellStore((s) => s.setPhantomFiles)
  const setStatusGlitch = useShellStore((s) => s.setStatusGlitch)

  const rafRef  = useRef<number>(0)
  const lastRef = useRef<number>(0)

  // ── Main clock ──────────────────────────────────────────────
  useEffect(() => {
    if (escaped) return
    lastRef.current = 0
    const loop = (ts: number) => {
      const dt = lastRef.current ? Math.min((ts - lastRef.current) / 1000, 0.1) : 0
      lastRef.current = ts
      tick(dt)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick, escaped])

  // ── Light mode animation ────────────────────────────────────
  useEffect(() => {
    if (escaped || phase < 1 || isDecoy) return
    const start = performance.now()
    const duration = 6000
    let animId: number

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      applyPalette(ease)
      if (t < 1) animId = requestAnimationFrame(step)
    }
    animId = requestAnimationFrame(step)

    return () => cancelAnimationFrame(animId)
  }, [phase, escaped, isDecoy])

  // When decoy ends mid-animation, restore the current light progress
  useEffect(() => {
    if (isDecoy || phase < 1 || escaped) return
    const { elapsed } = useBackroomsStore.getState()
    const t = Math.min(1, (elapsed - 5) / 6)
    applyPalette(t)
  }, [isDecoy, phase, escaped])

  // ── GlitchLevel driven by phase ─────────────────────────────
  useEffect(() => {
    if (escaped) return
    const levels: Record<number, number> = { 0: 0, 1: 0.3, 2: 0.7, 3: 0.9, 4: 0.9, 5: 0 }
    setGlitch(levels[phase] ?? 0)
    setStatusGlitch(phase >= 1)
  }, [phase, escaped, setGlitch, setStatusGlitch])

  // ── Phantom files ───────────────────────────────────────────
  useEffect(() => {
    if (escaped || phase < 1) { setPhantomFiles([]); return }

    let active = true
    const schedule = () => {
      const delay = 1000 + Math.random() * 2000
      window.setTimeout(() => {
        if (!active) return
        const count = 1 + Math.floor(Math.random() * 3)
        const shuffled = [...PHANTOM_POOL].sort(() => Math.random() - 0.5)
        setPhantomFiles(shuffled.slice(0, count))
        schedule()
      }, delay)
    }
    schedule()
    return () => { active = false; setPhantomFiles([]) }
  }, [phase, escaped, setPhantomFiles])

  // ── Flicker (phase 2+) ──────────────────────────────────────
  useEffect(() => {
    if (escaped || phase < 2 || isDecoy) return
    let active = true

    const scheduleFlicker = () => {
      if (!active) return
      // Every 4–8 seconds: brief white brightness pulse only (no dark/light toggle)
      const gap = 4000 + Math.random() * 4000
      window.setTimeout(() => {
        if (!active) return
        const el = flickerRef.current
        if (el) el.style.opacity = '0.9'
        window.setTimeout(() => {
          if (!active) return
          if (el) el.style.opacity = '0'
          scheduleFlicker()
        }, 60 + Math.random() * 80)
      }, gap)
    }
    scheduleFlicker()
    return () => { active = false }
  }, [phase, escaped, isDecoy, flickerRef])
}
