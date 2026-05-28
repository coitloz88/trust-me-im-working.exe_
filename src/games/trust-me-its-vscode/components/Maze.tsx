import type { ParsedMaze } from '../store/gameStore'

type Props = { maze: ParsedMaze }

export function Maze({ maze }: Props) {
  const cellW = 100 / maze.cols
  const cellH = 100 / maze.rows
  const nodes: React.ReactNode[] = []

  for (let r = 0; r < maze.rows; r++) {
    for (let c = 0; c < maze.cols; c++) {
      const ch = maze.grid[r][c]
      if (ch === '#') {
        nodes.push(
          <div
            key={`w${r}-${c}`}
            style={{
              position: 'absolute',
              left: `${c * cellW}%`,
              top: `${r * cellH}%`,
              width: `${cellW}%`,
              height: `${cellH}%`,
              background: 'var(--vsc-border)',
              boxSizing: 'border-box',
            }}
          />,
        )
      } else if (ch === '★') {
        nodes.push(
          <div
            key={`g${r}-${c}`}
            style={{
              position: 'absolute',
              left: `${c * cellW}%`,
              top: `${r * cellH}%`,
              width: `${cellW}%`,
              height: `${cellH}%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--vsc-accent-yellow)',
              fontSize: 14,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            ★
          </div>,
        )
      }
    }
  }

  return <>{nodes}</>
}
