import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useBackroomsStore } from '../store/backroomsStore'
import { useShellStore } from '../../../shared/store/shellStore'

type Char = {
  x: number; y: number; vy: number
  rot: number; rotV: number
  char: string; color: string; fontSize: number
  alpha: number
}

export function FallingLetters() {
  const phase   = useBackroomsStore((s) => s.phase)
  const escaped = useBackroomsStore((s) => s.escaped)
  const isDecoy = useShellStore((s) => s.isDecoy)

  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const charsRef     = useRef<Char[]>([])
  const activeRef    = useRef(false)
  const rafRef       = useRef<number>(0)
  const spawnTimers  = useRef<number[]>([])

  useEffect(() => {
    if (phase < 3 || escaped || isDecoy) {
      activeRef.current = false
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')!
    activeRef.current = true

    // Collect chars from the backrooms editor only.
    // CodeEditor stays in DOM (visibility:hidden) so getBoundingClientRect still works.
    const collectFromEditor = (): Char[] => {
      const out: Char[] = []
      const content = document.querySelector('.backrooms-editor__content')
      if (!content) return out

      const lines = content.querySelectorAll('div')
      lines.forEach((lineEl) => {
        const lineRect = lineEl.getBoundingClientRect()
        if (lineRect.height === 0) return

        // Walk the text nodes / spans within each line
        const walker = document.createTreeWalker(lineEl, NodeFilter.SHOW_TEXT)
        let node: Node | null
        let charX = lineRect.left

        while ((node = walker.nextNode())) {
          const text  = node.textContent ?? ''
          const pEl   = node.parentElement ?? lineEl
          const style = window.getComputedStyle(pEl)
          const fs    = parseInt(style.fontSize) || 14
          const color = style.color || '#cccccc'

          // Approximate per-char x offset using font metrics
          const approxCharW = fs * 0.6

          for (const ch of text) {
            if (!ch.trim()) { charX += approxCharW * 0.5; continue }
            if (Math.random() > 0.15) { charX += approxCharW; continue }  // keep ~15%

            out.push({
              x:    charX + Math.random() * 4,
              y:    lineRect.top + lineRect.height * 0.5 + (Math.random() - 0.5) * lineRect.height,
              vy:   1 + Math.random() * 3,
              rot:  (Math.random() - 0.5) * 0.4,
              rotV: (Math.random() - 0.5) * 0.12,
              char: ch,
              color,
              fontSize: fs,
              alpha: 0.8 + Math.random() * 0.2,
            })
            charX += approxCharW
          }
        }
      })
      return out
    }

    // Spawn bursts every 700ms, max 6 bursts, cap total at 120 chars
    let count = 0
    const spawnBurst = () => {
      if (!activeRef.current || count >= 6) return
      count++
      if (charsRef.current.length < 120) {
        const burst = collectFromEditor()
        charsRef.current = [...charsRef.current, ...burst]
      }
      const t = window.setTimeout(spawnBurst, 700)
      spawnTimers.current.push(t)
    }
    spawnBurst()

    // Physics loop
    const loop = () => {
      if (!activeRef.current) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      charsRef.current = charsRef.current.filter((c) => {
        c.y  += c.vy
        c.vy += 0.25
        c.rot += c.rotV
        c.alpha -= 0.007
        return c.y < canvas.height + 80 && c.alpha > 0
      })
      for (const c of charsRef.current) {
        ctx.save()
        ctx.globalAlpha = c.alpha
        ctx.font        = `${c.fontSize}px monospace`
        ctx.fillStyle   = c.color
        ctx.translate(c.x, c.y)
        ctx.rotate(c.rot)
        ctx.fillText(c.char, 0, 0)
        ctx.restore()
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      activeRef.current = false
      cancelAnimationFrame(rafRef.current)
      spawnTimers.current.forEach(clearTimeout)
      spawnTimers.current = []
      charsRef.current = []
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [phase, escaped, isDecoy])

  return createPortal(
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        display: phase >= 3 && !escaped && !isDecoy ? 'block' : 'none',
      }}
    />,
    document.body,
  )
}
