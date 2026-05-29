export type PlatformColor = 'kw' | 'fn' | 'str' | 'cmt' | 'num' | 'default'

export type Platform = {
  x: number        // world x, left edge
  y: number        // world y, top edge
  w: number
  h: number
  snippet: string
  color: PlatformColor
}

export type Enemy = {
  x: number        // world x center
  y: number        // world y center
  vx: number       // px/s patrol velocity
  minX: number     // patrol left bound
  maxX: number     // patrol right bound
}

export type Input = {
  jumpJustPressed: boolean
  jumpHeld: boolean
  fastFall: boolean
}

export type EngineState = {
  playerX: number       // world x, left edge
  playerY: number       // world y, top edge
  playerVy: number
  playerVx: number      // knockback/horizontal
  onGround: boolean
  coyoteTimer: number
  jumpsLeft: number
  invulnUntil: number   // Date.now() timestamp in ms
  lastSafeX: number
  lastSafeY: number
  cameraX: number       // world x that maps to screen x = 0
  canvasW: number
  canvasH: number
  groundY: number       // world y of top face of ground platforms
  speed: number         // current run speed px/s
  distancePx: number    // total px traveled from start
  spawnX: number        // world x where next chunk should start
  chunkIndex: number
  platforms: Platform[]
  enemies: Enemy[]
  hp: number
  gameOver: boolean
  blinkTimer: number
  blink: boolean        // cursor blink state
  snippets: string[]
}
