import type { EngineState } from './types'
import { PLAYER_W, PLAYER_H, PLAT_H, ENEMY_W, ENEMY_H, HP_MAX } from './world'

export type Colors = {
  bg: string
  platBg: string
  hover: string
  selection: string
  fg: string
  fgMuted: string
  kw: string
  fn: string
  str: string
  cmt: string
  num: string
  enemy: string
  hp: string
  border: string
}

export function readColors(): Colors {
  const cs = getComputedStyle(document.documentElement)
  const v = (n: string) => cs.getPropertyValue(n).trim()
  return {
    bg:        v('--vsc-bg-editor'),
    platBg:    v('--vsc-bg-sidebar'),
    hover:     v('--vsc-bg-hover'),
    selection: v('--vsc-bg-selection'),
    fg:        v('--vsc-fg'),
    fgMuted:   v('--vsc-fg-muted'),
    kw:        v('--vsc-accent-blue'),
    fn:        v('--vsc-accent-yellow'),
    str:       v('--vsc-accent-red'),
    cmt:       v('--vsc-fg-muted'),
    num:       v('--vsc-accent-teal'),
    enemy:     v('--vsc-accent-red'),
    hp:        v('--vsc-accent-teal'),
    border:    v('--vsc-border'),
  }
}

const GUTTER_W = 50
const FONT = "11px 'Cascadia Code', 'Consolas', 'Courier New', monospace"

function snippetColor(c: EngineState['platforms'][number]['color'], colors: Colors): string {
  switch (c) {
    case 'kw':   return colors.kw
    case 'fn':   return colors.fn
    case 'str':  return colors.str
    case 'cmt':  return colors.cmt
    case 'num':  return colors.num
    default:     return colors.fg
  }
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1)
  return t + '…'
}

export function renderEngine(ctx: CanvasRenderingContext2D, state: EngineState, colors: Colors): void {
  const { cameraX, canvasW, canvasH, playerX, playerY, platforms, enemies, hp, gameOver, blink } = state
  const now = Date.now()
  const invuln = now < state.invulnUntil

  ctx.font = FONT
  ctx.textBaseline = 'middle'

  // ── Background ────────────────────────────────────────────────────────────
  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, canvasW, canvasH)

  // ── Line number gutter ────────────────────────────────────────────────────
  ctx.fillStyle = colors.platBg
  ctx.fillRect(0, 0, GUTTER_W, canvasH)
  ctx.fillStyle = colors.border
  ctx.fillRect(GUTTER_W - 1, 0, 1, canvasH)

  const lineH = 18
  const firstLine = Math.floor(state.distancePx / 10) + 1
  ctx.fillStyle = colors.fgMuted
  ctx.textAlign = 'right'
  for (let i = 0; i < Math.ceil(canvasH / lineH) + 1; i++) {
    const sy = i * lineH + 9
    ctx.fillText(String(firstLine + i), GUTTER_W - 8, sy)
  }
  ctx.textAlign = 'left'

  // ── Platforms ─────────────────────────────────────────────────────────────
  for (const p of platforms) {
    const sx = p.x - cameraX + GUTTER_W
    if (sx + p.w < GUTTER_W || sx > canvasW) continue

    const clipL = Math.max(sx, GUTTER_W)
    const clipW = Math.min(sx + p.w, canvasW) - clipL

    // Platform background
    ctx.fillStyle = colors.hover
    ctx.fillRect(clipL, p.y, clipW, PLAT_H)

    // Top border line (1px in snippet color)
    ctx.fillStyle = snippetColor(p.color, colors)
    ctx.fillRect(clipL, p.y, clipW, 1)

    // Code text
    const textX = sx + 8
    if (textX < canvasW) {
      const maxTextW = p.x + p.w - cameraX + GUTTER_W - textX - 4
      if (maxTextW > 20) {
        const text = truncate(ctx, p.snippet, maxTextW)
        ctx.fillStyle = snippetColor(p.color, colors)
        ctx.fillText(text, Math.max(textX, GUTTER_W + 4), p.y + PLAT_H / 2)
      }
    }
  }

  // ── Enemies ───────────────────────────────────────────────────────────────
  for (const e of enemies) {
    const sx = e.x - cameraX + GUTTER_W - ENEMY_W * 0.5
    if (sx + ENEMY_W < GUTTER_W || sx > canvasW) continue
    ctx.fillStyle = colors.enemy
    ctx.fillRect(Math.round(sx), Math.round(e.y), ENEMY_W, ENEMY_H)
    // 'x' mark inside
    ctx.fillStyle = colors.bg
    ctx.font = "7px 'Consolas', monospace"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✕', Math.round(sx + ENEMY_W * 0.5), Math.round(e.y + ENEMY_H * 0.5))
    ctx.font = FONT
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
  }

  // ── Player (cursor) ───────────────────────────────────────────────────────
  const px = Math.round(playerX - cameraX + GUTTER_W)
  const py = Math.round(playerY)

  if (!gameOver) {
    // Invuln flash: skip every other frame-ish based on time
    const flash = invuln && Math.floor(now / 100) % 2 === 0
    if (!flash) {
      // Cursor body
      ctx.fillStyle = invuln ? colors.enemy : colors.fg
      ctx.globalAlpha = blink ? 1 : 0.25
      ctx.fillRect(px, py, PLAYER_W, PLAYER_H)
      ctx.globalAlpha = 1
      // Cursor top highlight (accent)
      ctx.fillStyle = invuln ? colors.enemy : colors.kw
      ctx.fillRect(px, py, PLAYER_W, 2)
    }
  } else {
    // Game over: draw fallen-over cursor (horizontal rect)
    ctx.fillStyle = colors.enemy
    ctx.globalAlpha = 0.6
    ctx.fillRect(px - PLAYER_H * 0.5 + PLAYER_W * 0.5, py + PLAYER_H - PLAYER_W, PLAYER_H, PLAYER_W)
    ctx.globalAlpha = 1
  }

  // ── HUD: HP indicator ─────────────────────────────────────────────────────
  const hudX = GUTTER_W + 8
  const hudY = 10
  for (let i = 0; i < HP_MAX; i++) {
    ctx.fillStyle = i < hp ? colors.hp : colors.border
    ctx.fillRect(hudX + i * 12, hudY, 8, 8)
  }

  // ── HUD: distance as fake comment ─────────────────────────────────────────
  const dist = Math.floor(state.distancePx / 10)
  ctx.fillStyle = colors.cmt
  ctx.textAlign = 'right'
  ctx.fillText(`// ${dist}m`, canvasW - 8, hudY + 4)
  ctx.textAlign = 'left'
}
