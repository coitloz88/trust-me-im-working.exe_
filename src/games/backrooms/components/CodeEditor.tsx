import { useEffect, useRef, useState } from 'react'
import { useBackroomsStore } from '../store/backroomsStore'
import { PHASE_0, PHASE_1, PHASE_2, type CursedLine } from '../content/cursedCode'

// ─── Palette ─────────────────────────────────────────────────────────────────

const COLORS = ['#5a1a1a', '#4a6b2a', '#6b5818', '#8a3a2a', '#1a4a3a', '#7a4a1a', '#3a5a1a']

function wordColor(lineIdx: number, wordIdx: number): string {
  return COLORS[(lineIdx * 7 + wordIdx * 3) % COLORS.length]
}

function charColor(ch: string): string {
  return COLORS[ch.charCodeAt(0) % COLORS.length]
}

// ─── Gibberish ────────────────────────────────────────────────────────────────

const GLYPHS = '░▒▓█■□▪◆○●∞∑∴ψΩΦλπ∂∇∈∅∧∨¬≠≈≡⌀⌁⌂ĔĕĘęĚěĜğĠġĢģĤĥĦħĨĩĪīĬĭĮįİ'

function genGibberish(): CursedLine {
  const len = 12 + Math.floor(Math.random() * 20)
  let s = ''
  for (let i = 0; i < len; i++) {
    s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    if (Math.random() > 0.75) s += ' '
  }
  return { text: s }
}

// ─── Line renderer ────────────────────────────────────────────────────────────

function LineContent({
  line,
  lineIdx,
  isComplete,
  phase,
  isGibberish,
}: {
  line: CursedLine
  lineIdx: number
  isComplete: boolean
  phase: number
  isGibberish: boolean
}) {
  if (!line.text.trim()) return <> </>

  // Gibberish phase: per-character colors
  if (isGibberish) {
    return (
      <>
        {[...line.text].map((ch, i) => (
          <span key={i} style={{ color: charColor(ch) }}>{ch}</span>
        ))}
      </>
    )
  }

  // Phase 1+, completed lines: per-word colors (override line.color)
  if (phase >= 1 && isComplete) {
    const words = line.text.split(/(\s+)/)
    let wordIdx = 0
    return (
      <>
        {words.map((w, i) => {
          if (!w.trim()) return <span key={i}>{w}</span>
          const color = line.color ?? wordColor(lineIdx, wordIdx++)
          return <span key={i} style={{ color }}>{w}</span>
        })}
      </>
    )
  }

  return <span style={{ color: line.color ?? 'var(--vsc-fg)' }}>{line.text}</span>
}

// ─── Component ────────────────────────────────────────────────────────────────

type DisplayLine = CursedLine & { fontSize?: number; complete?: boolean }

function variedSize(idx: number): number {
  return 10 + ((idx * 17 + 3) % 8)  // 10–17px
}

export function CodeEditor() {
  const phase   = useBackroomsStore((s) => s.phase)
  const escaped = useBackroomsStore((s) => s.escaped)

  const [displayed, setDisplayed] = useState<DisplayLine[]>([])
  const targetRef    = useRef<DisplayLine[]>([])
  const cursorRef    = useRef({ line: 0, ch: 0 })
  const timerRef     = useRef<number>(0)
  const prevPhaseRef = useRef(-1)
  const elapsedRef   = useRef(0)
  const gibberishRef = useRef(false)

  // Track elapsed without re-rendering
  useEffect(() => {
    return useBackroomsStore.subscribe((s) => {
      elapsedRef.current = s.elapsed
    })
  }, [])

  // Accumulate target lines when phase changes
  useEffect(() => {
    if (phase === prevPhaseRef.current) return
    prevPhaseRef.current = phase

    const withSize = (lines: CursedLine[], vary: boolean): DisplayLine[] =>
      lines.map((l, i) => ({
        ...l,
        fontSize: vary ? variedSize(targetRef.current.length + i) : undefined,
      }))

    if (phase === 0) targetRef.current = withSize(PHASE_0, false)
    else if (phase === 1) targetRef.current = [...targetRef.current, ...withSize(PHASE_1, false)]
    else if (phase === 2) targetRef.current = [...targetRef.current, ...withSize(PHASE_2, true)]
  }, [phase])

  // Typing effect
  useEffect(() => {
    if (escaped || phase >= 3) return

    const type = () => {
      const elapsed = elapsedRef.current
      // Switch to fast gibberish after 18s
      if (elapsed >= 18 && phase >= 2 && !gibberishRef.current) {
        gibberishRef.current = true
      }
      if (elapsed >= 18 && phase >= 2) {
        // Append a new gibberish line and keep going
        const gib: DisplayLine = { ...genGibberish(), fontSize: variedSize(Math.random() * 20 | 0) }
        setDisplayed((prev) => [...prev.slice(-30), gib])
        timerRef.current = window.setTimeout(type, 40 + Math.random() * 60)
        return
      }

      const target = targetRef.current
      const cur = cursorRef.current

      if (cur.line >= target.length) {
        timerRef.current = window.setTimeout(type, 300)
        return
      }
      const targetLine = target[cur.line]

      if (cur.ch <= targetLine.text.length) {
        setDisplayed((prev) => {
          const next = [...prev]
          while (next.length <= cur.line) next.push({ text: '' })
          next[cur.line] = { ...targetLine, text: targetLine.text.slice(0, cur.ch), complete: false }
          return next
        })
        cur.ch++
      } else {
        // Mark line complete, move to next
        setDisplayed((prev) => {
          const next = [...prev]
          if (next[cur.line]) next[cur.line] = { ...next[cur.line], complete: true }
          return next
        })
        cur.line++
        cur.ch = 0
        setDisplayed((prev) => (prev.length <= cur.line ? [...prev, { text: '' }] : prev))
      }

      const base = phase === 0 ? 70 : phase === 1 ? 40 : 18
      timerRef.current = window.setTimeout(type, base + Math.random() * base)
    }

    timerRef.current = window.setTimeout(type, 600)
    return () => clearTimeout(timerRef.current)
  }, [phase, escaped])

  if (escaped) return null

  // Phase 3+: stay in DOM but invisible so FallingLetters can scan positions
  const hidden = phase >= 3

  return (
    <div className="backrooms-editor" style={hidden ? { visibility: 'hidden' } : undefined}>
      <div className="editor__gutter">
        {displayed.map((_, i) => <span key={i}>{i + 1}</span>)}
        {!hidden && <span style={{ opacity: 0.25 }}>{displayed.length + 1}</span>}
      </div>
      <div className="backrooms-editor__content">
        {displayed.map((line, i) => (
          <div
            key={i}
            style={{ fontSize: line.fontSize, lineHeight: '19px' }}
          >
            <LineContent
              line={line}
              lineIdx={i}
              isComplete={!!line.complete}
              phase={phase}
              isGibberish={gibberishRef.current && phase >= 2}
            />
          </div>
        ))}
        {!hidden && <span style={{ color: 'var(--vsc-fg)', opacity: 0.6 }}>▌</span>}
      </div>
    </div>
  )
}
