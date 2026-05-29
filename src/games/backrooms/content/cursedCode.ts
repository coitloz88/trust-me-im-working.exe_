export type CursedLine = { text: string; color?: string }

// Phase 0 — looks normal, but not React
export const PHASE_0: CursedLine[] = [
  { text: '// workspace init v0.9.1' },
  { text: "const env  = loadConfig('./env.json')" },
  { text: 'const proc = spawn(env.entry, [])' },
  { text: '' },
  { text: "proc.on('ready', () => {" },
  { text: "  log('[OK] process started')" },
  { text: '  loop(proc)' },
  { text: '})' },
  { text: '' },
  { text: 'function loop(p) {' },
  { text: "  setInterval(() => p.ping(), 1000)" },
  { text: '}' },
]

// Phase 1 — subtly wrong
export const PHASE_1: CursedLine[] = [
  { text: '' },
  { text: '// stop writing code', color: '#858585' },
  { text: "proc.on('data', chunk => {" },
  { text: '  if (chunk === undefined) {', color: '#5a1a1a' },
  { text: '    // I can\' controll my AI agent!', color: '#858585' },
  { text: '    return void.exit(0)', color: '#5a1a1a' },
  { text: '  }' },
  { text: "  write(chunk.decode('null'))", color: '#6b5818' },
  { text: '})' },
  { text: '' },
  { text: "const path = resolve('./level_0')" },
  { text: '// path === null', color: '#4a6b2a' },
  { text: '// path === null', color: '#4a6b2a' },
  { text: '// path === null', color: '#4a6b2a' },
]

// Phase 2 — overtly corrupted (slow gibberish; fast gibberish is generated in CodeEditor)
export const PHASE_2: CursedLine[] = [
  { text: '' },
  { text: 'while (you.exist()) { forget(self) }', color: '#5a1a1a' },
  { text: '// no exit  no exit  no exit', color: '#4a6b2a' },
  { text: 'type You = never', color: '#6b5818' },
  { text: '' },
  { text: '████ noclip ████  ████ noclip ████', color: '#5a1a1a' },
  { text: '// 뒤에 누군가 있다', color: '#4a6b2a' },
  { text: '████████████████████████████', color: '#6b5818' },
]
