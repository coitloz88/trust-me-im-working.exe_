import type { Platform, Enemy, EngineState, Input, PlatformColor } from './types'

// ── Constants ─────────────────────────────────────────────────────────────────

const PLAYER_W = 8
const PLAYER_H = 14
export { PLAYER_W, PLAYER_H }

const GRAVITY = 1600          // px/s²
const JUMP_VY = -600          // first jump
const JUMP2_VY = -450         // double jump
const FAST_FALL_BOOST = 900   // extra gravity on down-hold
const SPEED_INIT = 200        // px/s
const SPEED_MAX = 520
const SPEED_RAMP = 0.014      // multiplied by (SPEED_MAX - SPEED_INIT), per px
const COYOTE_TIME = 0.1       // seconds of coyote time
const INVULN_MS = 900
export const HP_MAX = 3
const PLAT_H = 20
export { PLAT_H }
const CHUNK_W = 600
const SPAWN_AHEAD = 900
const CULL_BEHIND = 400
const PLAYER_SCREEN_RATIO = 0.25  // player fixed at 25% from screen left
const ENEMY_SPEED = 55
const ENEMY_W = 8
const ENEMY_H = 8
export { ENEMY_W, ENEMY_H }
const GUTTER_W = 50

// ── Seeded RNG ────────────────────────────────────────────────────────────────

function makeRng(seed: number) {
  let s = (seed | 0) + 1
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b)
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b)
    s ^= s >>> 16
    return ((s >>> 0) / 0x100000000)
  }
}

// ── Snippet classification ────────────────────────────────────────────────────

function classifySnippet(s: string): PlatformColor {
  if (/^\s*\/\//.test(s)) return 'cmt'
  if (/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|type|interface|extends|implements|async|await|new|throw)\b/.test(s)) return 'kw'
  if (/^\s*[a-zA-Z_]\w*\s*[(<]/.test(s) || /\b(?:use[A-Z]|[a-z]+[A-Z])\w*\s*[(<(]/.test(s)) return 'fn'
  if (/['"`]/.test(s)) return 'str'
  if (/\b\d+\b/.test(s)) return 'num'
  return 'default'
}

// ── Platform / enemy factories ────────────────────────────────────────────────

function makePlat(x: number, y: number, w: number, snippets: string[], rng: () => number): Platform {
  const snippet = snippets[Math.floor(rng() * snippets.length)]
  return { x, y, w, h: PLAT_H, snippet, color: classifySnippet(snippet) }
}

function makeEnemy(x: number, y: number, minX: number, maxX: number): Enemy {
  return { x, y: y - ENEMY_H, vx: ENEMY_SPEED, minX, maxX }
}

// ── Chunk generation ──────────────────────────────────────────────────────────

type ChunkType = 'safe' | 'gap_s' | 'gap_m' | 'gap_l' | 'steps'

function pickChunkType(chunkIndex: number, rng: () => number): ChunkType {
  if (chunkIndex < 2) return 'safe'
  if (chunkIndex < 4) return 'gap_s'
  let pool: ChunkType[]
  if      (chunkIndex < 8)  pool = ['safe', 'gap_s', 'gap_s', 'gap_m']
  else if (chunkIndex < 14) pool = ['gap_s', 'gap_m', 'gap_m', 'gap_l', 'gap_l']
  else                       pool = ['gap_m', 'gap_l', 'gap_l', 'steps', 'steps', 'steps']
  return pool[Math.floor(rng() * pool.length)]
}

function generateChunk(state: EngineState): void {
  const { spawnX, groundY, chunkIndex, snippets } = state
  const rng = makeRng(chunkIndex * 7919 + 31337)
  const type = pickChunkType(chunkIndex, rng)
  const spawnEnemies = chunkIndex >= 5
  const P = (x: number, y: number, w: number) => state.platforms.push(makePlat(x, y, w, snippets, rng))
  const E = (x: number, y: number, l: number, r: number) => state.enemies.push(makeEnemy(x, y, l, r))

  let x = spawnX

  switch (type) {
    case 'safe': {
      P(x, groundY, CHUNK_W)
      break
    }
    case 'gap_s': {
      const gapW = 50 + Math.floor(rng() * 50)
      const leftW = 90 + Math.floor(rng() * 120)
      const rightW = CHUNK_W - leftW - gapW
      P(x, groundY, leftW)
      if (spawnEnemies && rng() < 0.35) E(x + leftW * 0.5, groundY, x, x + leftW)
      x += leftW + gapW
      P(x, groundY, Math.max(60, rightW))
      break
    }
    case 'gap_m': {
      const gapW = 90 + Math.floor(rng() * 70)
      const leftW = 80 + Math.floor(rng() * 100)
      const rightW = CHUNK_W - leftW - gapW
      P(x, groundY, leftW)
      if (spawnEnemies && rng() < 0.4) E(x + leftW * 0.5, groundY, x, x + leftW)
      x += leftW
      if (rng() < 0.55) {
        const fy = groundY - 80 - Math.floor(rng() * 50)
        const fw = 65 + Math.floor(rng() * 70)
        const fx = x + gapW * 0.5 - fw * 0.5
        P(fx, fy, fw)
        if (spawnEnemies && rng() < 0.3) E(fx + fw * 0.5, fy, fx, fx + fw)
      }
      x += gapW
      P(x, groundY, Math.max(60, rightW))
      break
    }
    case 'gap_l': {
      const gapW = 150 + Math.floor(rng() * 120)
      const leftW = 60 + Math.floor(rng() * 80)
      const rightW = CHUNK_W - leftW - gapW
      P(x, groundY, leftW)
      x += leftW
      const numFloats = rng() < 0.45 ? 1 : 2
      if (numFloats === 1) {
        const fy = groundY - 80 - Math.floor(rng() * 60)
        const fw = 70 + Math.floor(rng() * 80)
        const fx = x + gapW * 0.5 - fw * 0.5
        P(fx, fy, fw)
        if (spawnEnemies && rng() < 0.35) E(fx + fw * 0.5, fy, fx, fx + fw)
      } else {
        const seg = gapW / 3
        const fy1 = groundY - 75 - Math.floor(rng() * 35)
        const fy2 = groundY - 85 - Math.floor(rng() * 45)
        const fw = 55 + Math.floor(rng() * 45)
        P(x + seg * 0.4 - fw * 0.5, fy1, fw)
        P(x + seg * 1.7 - fw * 0.5, fy2, fw)
        if (spawnEnemies && rng() < 0.3) E(x + seg * 1.7, fy2, x + seg * 1.2, x + seg * 2.2)
      }
      x += gapW
      P(x, groundY, Math.max(60, rightW))
      break
    }
    case 'steps': {
      const startW = 60 + Math.floor(rng() * 40)
      P(x, groundY, startW)
      x += startW
      const numSteps = 3 + Math.floor(rng() * 3)
      const totalStepArea = CHUNK_W * 0.7
      const step = totalStepArea / numSteps
      for (let i = 0; i < numSteps; i++) {
        const fy = groundY - 65 - Math.floor(rng() * 85)
        const fw = 50 + Math.floor(rng() * 60)
        const fx = x + step * i + (step - fw) * 0.5
        P(fx, fy, fw)
        if (spawnEnemies && rng() < 0.3) E(fx + fw * 0.5, fy, fx, fx + fw)
      }
      x += totalStepArea
      P(x, groundY, Math.max(60, CHUNK_W * 0.3 - startW))
      break
    }
  }

  state.spawnX += CHUNK_W
  state.chunkIndex += 1
}

// ── Respawn helper ────────────────────────────────────────────────────────────

function respawnPlayer(state: EngineState): void {
  const spawnScreenX = Math.round(state.canvasW * PLAYER_SCREEN_RATIO)
  const spawnWorldX = state.cameraX + spawnScreenX
  // Find nearest platform below or at spawn point
  let bestY = state.groundY - PLAYER_H
  let bestFound = false
  for (const p of state.platforms) {
    if (p.x <= spawnWorldX + PLAYER_W && p.x + p.w >= spawnWorldX) {
      if (!bestFound || p.y < bestY + PLAYER_H) {
        bestY = p.y - PLAYER_H
        bestFound = true
      }
    }
  }
  state.playerX = spawnWorldX
  state.playerY = bestY
  state.playerVy = 0
  state.playerVx = 0
  state.onGround = false
}

// ── Public API ────────────────────────────────────────────────────────────────

export function createEngine(canvasW: number, canvasH: number, snippets: string[]): EngineState {
  const groundY = canvasH - 44
  const playerScreenX = Math.round(canvasW * PLAYER_SCREEN_RATIO)

  const state: EngineState = {
    playerX: playerScreenX,
    playerY: groundY - PLAYER_H,
    playerVy: 0,
    playerVx: 0,
    onGround: true,
    coyoteTimer: 0,
    jumpsLeft: 2,
    invulnUntil: Date.now() + 1000,  // grace period at start
    lastSafeX: playerScreenX,
    lastSafeY: groundY - PLAYER_H,
    cameraX: 0,
    canvasW,
    canvasH,
    groundY,
    speed: SPEED_INIT,
    distancePx: 0,
    spawnX: 0,
    chunkIndex: 0,
    platforms: [],
    enemies: [],
    hp: HP_MAX,
    gameOver: false,
    blinkTimer: 0,
    blink: true,
    snippets,
  }

  // Seed initial chunks
  while (state.spawnX < canvasW + SPAWN_AHEAD) generateChunk(state)

  return state
}

export function resizeEngine(state: EngineState, newW: number, newH: number): void {
  const newGroundY = newH - 44
  const deltaY = newGroundY - state.groundY
  for (const p of state.platforms) p.y += deltaY
  for (const e of state.enemies) e.y += deltaY
  state.playerY += deltaY
  state.lastSafeY += deltaY
  state.groundY = newGroundY
  state.canvasW = newW
  state.canvasH = newH
}

export function updateEngine(state: EngineState, dt: number, input: Input): void {
  if (state.gameOver) return
  const now = Date.now()

  // ── Blink ─────────────────────────────────────────────────────────────────
  state.blinkTimer += dt
  if (state.blinkTimer >= 0.5) { state.blink = !state.blink; state.blinkTimer = 0 }

  // ── Speed ramp ─────────────────────────────────────────────────────────────
  const targetSpeed = Math.min(SPEED_INIT + state.distancePx * SPEED_RAMP * (SPEED_MAX - SPEED_INIT), SPEED_MAX)
  state.speed += (targetSpeed - state.speed) * Math.min(dt * 2, 1)

  // ── Horizontal ────────────────────────────────────────────────────────────
  state.playerVx *= Math.max(0, 1 - dt * 6)
  state.playerX += (state.speed + state.playerVx) * dt

  // Camera follows player
  const playerScreenX = Math.round(state.canvasW * PLAYER_SCREEN_RATIO)
  state.cameraX = state.playerX - playerScreenX

  // Track distance
  state.distancePx = Math.max(0, state.playerX - playerScreenX)

  // ── Vertical ──────────────────────────────────────────────────────────────
  const prevVy = state.playerVy
  state.playerVy += GRAVITY * dt
  if (input.fastFall && state.playerVy < 200) state.playerVy += FAST_FALL_BOOST * dt
  // Variable jump: cut upward velocity when button released
  if (!input.jumpHeld && state.playerVy < -180) state.playerVy = -180

  const prevOnGround = state.onGround
  state.playerY += state.playerVy * dt

  // One-way platform collision (land from above only)
  state.onGround = false
  for (const p of state.platforms) {
    if (state.playerX + PLAYER_W <= p.x || state.playerX >= p.x + p.w) continue
    const foot = state.playerY + PLAYER_H
    const prevFoot = foot - state.playerVy * dt
    if (prevVy >= 0 && prevFoot <= p.y + 1 && foot >= p.y) {
      state.playerY = p.y - PLAYER_H
      state.playerVy = 0
      state.onGround = true
      state.lastSafeX = state.playerX
      state.lastSafeY = state.playerY
      break
    }
  }

  // Coyote time
  if (prevOnGround && !state.onGround) {
    state.coyoteTimer = COYOTE_TIME
  } else {
    state.coyoteTimer = state.onGround ? 0 : Math.max(0, state.coyoteTimer - dt)
  }
  if (state.onGround) state.jumpsLeft = 2

  // Jump
  if (input.jumpJustPressed) {
    const canJump = state.onGround || state.coyoteTimer > 0
    const canDoubleJump = !canJump && state.jumpsLeft > 0
    if (canJump) {
      state.playerVy = JUMP_VY
      state.coyoteTimer = 0
      state.jumpsLeft = 1
    } else if (canDoubleJump) {
      state.playerVy = JUMP2_VY
      state.jumpsLeft = 0
    }
  }

  // ── Fall off screen ────────────────────────────────────────────────────────
  if (state.playerY > state.canvasH + 60) {
    if (now > state.invulnUntil) {
      state.hp -= 1
      if (state.hp <= 0) { state.hp = 0; state.gameOver = true; return }
      state.invulnUntil = now + INVULN_MS
    }
    respawnPlayer(state)
  }

  // ── Enemy patrol and collision ─────────────────────────────────────────────
  for (const e of state.enemies) {
    e.x += e.vx * dt
    if (e.x <= e.minX || e.x >= e.maxX) e.vx = -e.vx
    if (now <= state.invulnUntil) continue
    const dx = (state.playerX + PLAYER_W * 0.5) - e.x
    const dy = (state.playerY + PLAYER_H * 0.5) - e.y
    if (Math.abs(dx) < (PLAYER_W + ENEMY_W) * 0.5 && Math.abs(dy) < (PLAYER_H + ENEMY_H) * 0.5) {
      state.hp -= 1
      if (state.hp <= 0) { state.hp = 0; state.gameOver = true; return }
      state.invulnUntil = now + INVULN_MS
      state.playerVy = -280
      state.playerVx = dx > 0 ? -240 : 240
    }
  }

  // ── Chunk spawn / cull ─────────────────────────────────────────────────────
  while (state.playerX + SPAWN_AHEAD > state.spawnX) generateChunk(state)
  const cullX = state.cameraX - CULL_BEHIND
  state.platforms = state.platforms.filter(p => p.x + p.w > cullX)
  state.enemies   = state.enemies.filter(e => e.x + ENEMY_W > cullX)

  // Gutter width: draw content area starts after GUTTER_W
  // Ensure camera never shows negative world x (before gutter)
  if (state.cameraX < -GUTTER_W) state.cameraX = -GUTTER_W
}
