import { useEffect, useRef } from 'react'
import { createEngine, updateEngine, resizeEngine } from './engine/world'
import { renderEngine, readColors, type Colors } from './engine/render'
import type { EngineState, Input } from './engine/types'
import { useGameStore } from './store/gameStore'
import snippets from './content/snippets.json'
import './styles.css'

export function TrustMeItsVscode() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const engineRef  = useRef<EngineState | null>(null)
  const colorsRef  = useRef<Colors | null>(null)
  const inputRef   = useRef<Input>({ jumpJustPressed: false, jumpHeld: false, fastFall: false })
  const rafRef     = useRef<number>(0)
  const lastTsRef  = useRef<number>(0)

  const generation = useGameStore((s) => s.generation)
  const setStats   = useGameStore((s) => s.setStats)

  // ── Init / re-init on reset ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    canvas.width  = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    engineRef.current = createEngine(w, h, snippets)
    colorsRef.current = readColors()
    lastTsRef.current = 0
  }, [generation])

  // ── ResizeObserver ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      if (width === 0 || height === 0) return
      const dpr = window.devicePixelRatio || 1
      canvas.width  = width * dpr
      canvas.height = height * dpr
      const ctx = canvas.getContext('2d')!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (engineRef.current) resizeEngine(engineRef.current, width, height)
    })
    obs.observe(canvas)
    return () => obs.disconnect()
  }, [])

  // ── Keyboard input ─────────────────────────────────────────────────────────
  useEffect(() => {
    const JUMP  = new Set(['Space', 'ArrowUp', 'KeyW'])
    const DOWN  = new Set(['ArrowDown', 'KeyS'])
    const SCROLL = new Set(['Space', 'ArrowUp', 'ArrowDown'])

    const onDown = (e: KeyboardEvent) => {
      if (SCROLL.has(e.code)) e.preventDefault()
      if (JUMP.has(e.code)) {
        if (!e.repeat) inputRef.current.jumpJustPressed = true
        inputRef.current.jumpHeld = true
      }
      if (DOWN.has(e.code)) inputRef.current.fastFall = true
    }
    const onUp = (e: KeyboardEvent) => {
      if (JUMP.has(e.code)) inputRef.current.jumpHeld = false
      if (DOWN.has(e.code)) inputRef.current.fastFall = false
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  // ── rAF game loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let lastHp = 3, lastDist = 0, lastGameOver = false

    const loop = (ts: number) => {
      rafRef.current = requestAnimationFrame(loop)
      const dt = lastTsRef.current ? Math.min((ts - lastTsRef.current) / 1000, 0.1) : 0
      lastTsRef.current = ts

      const engine = engineRef.current
      const colors = colorsRef.current
      if (!engine || !colors) return

      // Copy input and clear "just pressed" flags
      const input: Input = { ...inputRef.current }
      inputRef.current.jumpJustPressed = false

      updateEngine(engine, dt, input)

      // Sync stats to store only when values change
      const newDist = Math.floor(engine.distancePx / 10)
      if (engine.hp !== lastHp || newDist !== lastDist || engine.gameOver !== lastGameOver) {
        lastHp = engine.hp
        lastDist = newDist
        lastGameOver = engine.gameOver
        setStats(engine.hp, engine.distancePx, engine.gameOver)
      }

      // Draw — skip if canvas has no size (decoy / hidden)
      const dpr = window.devicePixelRatio || 1
      const displayW = canvas.width / dpr
      const displayH = canvas.height / dpr
      if (displayW === 0 || displayH === 0) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      renderEngine(ctx, engine, colors)
      ctx.restore()
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [generation, setStats])

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'var(--vsc-bg-editor)' }}>
      <canvas ref={canvasRef} className="runner-canvas" />
    </div>
  )
}
