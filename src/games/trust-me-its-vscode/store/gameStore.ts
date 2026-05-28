import { create } from 'zustand'
import mazesData from '../content/mazes.json'

// ─── Types ───────────────────────────────────────────────────────────────────

export type Bug = {
  id: string
  x: number   // 0–100 (% of container)
  y: number
  vx: number  // % per second
  vy: number
}

export type ParsedMaze = {
  name: string
  rows: number
  cols: number
  grid: string[]
  passageCells: Array<{ col: number; row: number }>
  startCol: number
  startRow: number
  goalCol: number
  goalRow: number
}

type GameState = {
  maze: ParsedMaze
  mazeIndex: number
  levelsCleared: number
  bugs: Bug[]
  playerX: number
  playerY: number
  hp: number
  score: number
  elapsed: number
  gameOver: boolean
  invulnUntil: number  // Date.now() ms timestamp
  spawnBug: () => void
  tick: (dt: number) => void
  setPlayerPos: (x: number, y: number) => void
  reset: () => void
}

// ─── Constants ───────────────────────────────────────────────────────────────

const HP_MAX = 3
const BUG_SPEED_BASE = 18     // %/s at level 0
const BUG_SPEED_PER_LEVEL = 6 // %/s added per level
const BUG_SPEED_MAX = 55
const BUG_HIT_RADIUS = 3.5    // % distance for bug-player collision
const INVULN_MS = 600          // ms of invulnerability after hit

// ─── Maze helpers ─────────────────────────────────────────────────────────────

function parseMaze(index: number): ParsedMaze {
  const raw = mazesData.mazes[index % mazesData.mazes.length]
  const grid = raw.grid
  const rows = grid.length
  const cols = grid[0].length
  const passageCells: ParsedMaze['passageCells'] = []
  let startCol = 1, startRow = 1
  let goalCol = cols - 2, goalRow = rows - 2

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = grid[r][c]
      if (ch !== '#') passageCells.push({ col: c, row: r })
      if (ch === '●') { startCol = c; startRow = r }
      if (ch === '★') { goalCol = c; goalRow = r }
    }
  }

  return { name: raw.name, rows, cols, grid, passageCells, startCol, startRow, goalCol, goalRow }
}

// Returns the character at (xPct, yPct) in the maze grid. '#' for out-of-bounds.
export function cellAt(maze: ParsedMaze, xPct: number, yPct: number): string {
  const col = Math.floor(xPct / (100 / maze.cols))
  const row = Math.floor(yPct / (100 / maze.rows))
  if (row < 0 || row >= maze.rows || col < 0 || col >= maze.cols) return '#'
  return maze.grid[row]?.[col] ?? '#'
}

function pctFromCell(maze: ParsedMaze, col: number, row: number) {
  return {
    x: (col + 0.5) * (100 / maze.cols),
    y: (row + 0.5) * (100 / maze.rows),
  }
}

function goalPct(maze: ParsedMaze) {
  return pctFromCell(maze, maze.goalCol, maze.goalRow)
}

function startPct(maze: ParsedMaze) {
  return pctFromCell(maze, maze.startCol, maze.startRow)
}

// ─── Bug helpers ─────────────────────────────────────────────────────────────

let bugCounter = 0

function makeBug(
  maze: ParsedMaze,
  playerX: number,
  playerY: number,
  speed: number,
): Bug {
  // Pick a corridor cell far enough from player to avoid cheap hits
  const MIN_DIST = 20
  const candidates = maze.passageCells.filter(({ col, row }) => {
    const { x, y } = pctFromCell(maze, col, row)
    return Math.hypot(playerX - x, playerY - y) > MIN_DIST
  })
  const pool = candidates.length > 0 ? candidates : maze.passageCells
  const cell = pool[Math.floor(Math.random() * pool.length)]
  const { x: bx, y: by } = pctFromCell(maze, cell.col, cell.row)

  const dx = playerX - bx
  const dy = playerY - by
  const dist = Math.hypot(dx, dy) || 1

  return { id: `bug-${++bugCounter}`, x: bx, y: by, vx: (dx / dist) * speed, vy: (dy / dist) * speed }
}

// ─── Level transition helper ──────────────────────────────────────────────────

function nextLevelFields(s: GameState): Partial<GameState> {
  const newIndex = s.mazeIndex + 1
  const newMaze = parseMaze(newIndex)
  const { x, y } = startPct(newMaze)
  return {
    mazeIndex: newIndex,
    maze: newMaze,
    levelsCleared: s.levelsCleared + 1,
    bugs: [],
    playerX: x,
    playerY: y,
    invulnUntil: Date.now() + 1500,  // grace period on level start
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

const initialMaze = parseMaze(0)
const initialStart = startPct(initialMaze)

export const useGameStore = create<GameState>((set, get) => ({
  maze: initialMaze,
  mazeIndex: 0,
  levelsCleared: 0,
  bugs: [],
  playerX: initialStart.x,
  playerY: initialStart.y,
  hp: HP_MAX,
  score: 0,
  elapsed: 0,
  gameOver: false,
  invulnUntil: 0,

  spawnBug: () => {
    const { playerX, playerY, mazeIndex, maze, gameOver } = get()
    if (gameOver) return
    const speed = Math.min(BUG_SPEED_BASE + mazeIndex * BUG_SPEED_PER_LEVEL, BUG_SPEED_MAX)
    set((s) => ({ bugs: [...s.bugs, makeBug(maze, playerX, playerY, speed)] }))
  },

  tick: (dt) => {
    const { gameOver, playerX, playerY } = get()
    if (gameOver) return

    set((s) => {
      const { maze } = s
      const now = Date.now()
      const newElapsed = s.elapsed + dt
      let newHp = s.hp
      let newInvulnUntil = s.invulnUntil
      const surviving: Bug[] = []

      for (const bug of s.bugs) {
        // Move with wall reflection: try each axis independently
        const newX = bug.x + bug.vx * dt
        const newY = bug.y + bug.vy * dt
        const inWallX = cellAt(maze, newX, bug.y) === '#'
        const inWallY = cellAt(maze, bug.x, newY) === '#'

        const fx = inWallX ? bug.x : newX
        const fy = inWallY ? bug.y : newY
        const fvx = inWallX ? -bug.vx : bug.vx
        const fvy = inWallY ? -bug.vy : bug.vy

        // Bug–player collision
        if (Math.hypot(playerX - fx, playerY - fy) < BUG_HIT_RADIUS && now > newInvulnUntil) {
          newHp -= 1
          newInvulnUntil = now + INVULN_MS
          continue  // consume the bug
        }

        surviving.push({ ...bug, x: fx, y: fy, vx: fvx, vy: fvy })
      }

      // Check goal reached
      const gp = goalPct(maze)
      const cellW = 100 / maze.cols
      const cellH = 100 / maze.rows
      const reachedGoal =
        Math.abs(playerX - gp.x) < cellW * 0.6 &&
        Math.abs(playerY - gp.y) < cellH * 0.6

      if (reachedGoal) {
        return {
          ...nextLevelFields(s),
          hp: newHp,
          score: Math.floor(newElapsed),
          elapsed: newElapsed,
          gameOver: newHp <= 0,
        }
      }

      return {
        bugs: surviving,
        hp: newHp,
        invulnUntil: newInvulnUntil,
        score: Math.floor(newElapsed),
        elapsed: newElapsed,
        gameOver: newHp <= 0,
      }
    })
  },

  setPlayerPos: (x, y) => {
    set((s) => {
      if (s.gameOver) return {}
      const { maze } = s
      const now = Date.now()
      const cell = cellAt(maze, x, y)

      if (cell === '#' && now > s.invulnUntil) {
        const newHp = s.hp - 1
        return { playerX: x, playerY: y, hp: newHp, invulnUntil: now + INVULN_MS, gameOver: newHp <= 0 }
      }

      return { playerX: x, playerY: y }
    })
  },

  reset: () => {
    bugCounter = 0
    const maze = parseMaze(0)
    const { x, y } = startPct(maze)
    set({
      maze,
      mazeIndex: 0,
      levelsCleared: 0,
      bugs: [],
      playerX: x,
      playerY: y,
      hp: HP_MAX,
      score: 0,
      elapsed: 0,
      gameOver: false,
      invulnUntil: 0,
    })
  },
}))
