import { useMemo } from 'react'
import { useShellStore } from '../store/shellStore'

const CORRUPT: Record<string, string> = {
  a: 'à', e: 'ë', i: 'ï', o: 'ô', u: 'ü',
  A: 'À', E: 'Ë', I: 'Ï', O: 'Ô', U: 'Ü',
  n: 'ñ', c: 'ç', s: 'š',
}

function corrupt(ch: string, level: number, idx: number): string {
  if (level < 0.6) return ch
  // deterministic: use char code + index so it doesn't change on re-render
  const seed = (ch.charCodeAt(0) * 31 + idx) % 100
  if (seed > level * 70) return ch
  return CORRUPT[ch] ?? ch
}

type Props = { text: string }

export function ShakyText({ text }: Props) {
  const glitchLevel = useShellStore((s) => s.glitchLevel)
  const isDecoy = useShellStore((s) => s.isDecoy)
  const level = isDecoy ? 0 : glitchLevel

  const chars = useMemo(() => {
    if (level < 0.1) return null
    return [...text].map((ch, i) => ({
      ch: corrupt(ch, level, i),
      // deterministic animation timing via fixed formula
      dur: 0.2 + (((i * 13 + 5) % 7) / 7) * 0.3,
      delay: i * 0.04,
      size: level > 0.5 ? 0.85 + (((i * 17 + 7) % 100) / 100) * 0.3 : 1,
    }))
  }, [text, level])

  if (!chars) return <>{text}</>

  return (
    <>
      {chars.map((c, i) => (
        <span
          key={i}
          className="shaky"
          style={{
            '--shake-dur': `${c.dur}s`,
            animationDelay: `${c.delay}s`,
            ...(c.size !== 1 ? { fontSize: `${c.size}em` } : {}),
          } as React.CSSProperties}
        >
          {c.ch}
        </span>
      ))}
    </>
  )
}
