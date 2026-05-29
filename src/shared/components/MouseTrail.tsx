import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useShellStore } from '../store/shellStore'

type Point = { x: number; y: number; t: number }

export function MouseTrail() {
  const glitchLevel = useShellStore((s) => s.glitchLevel)
  const isDecoy = useShellStore((s) => s.isDecoy)
  const active = glitchLevel > 0.25 && !isDecoy

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef<Point[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')!

    const onMove = (e: MouseEvent) => {
      pointsRef.current.push({ x: e.clientX, y: e.clientY, t: Date.now() })
      if (pointsRef.current.length > 20) pointsRef.current.shift()
    }
    window.addEventListener('mousemove', onMove)

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const now = Date.now()
      pointsRef.current = pointsRef.current.filter((p) => now - p.t < 500)

      for (let i = 0; i < pointsRef.current.length; i++) {
        const p = pointsRef.current[i]
        const age = (now - p.t) / 500
        const alpha = (1 - age) * 0.35 * glitchLevel
        const r = 3 * (1 - age * 0.5)
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(160, 130, 60, ${alpha})`
        ctx.fill()
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [active, glitchLevel])

  return createPortal(
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9997,
        display: active ? 'block' : 'none',
      }}
    />,
    document.body,
  )
}
