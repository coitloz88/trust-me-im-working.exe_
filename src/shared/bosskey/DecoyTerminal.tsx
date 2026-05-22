const PANEL_TABS = ['Problems', 'Output', 'Debug Console', 'Terminal', 'Ports']

const LOG_LINES: { text: string; prompt?: boolean }[] = [
  { prompt: true, text: 'pnpm build' },
  { text: '' },
  { text: '> trust-me-im-working.exe_@0.0.0 build' },
  { text: '> tsc -b && vite build' },
  { text: '' },
  { text: 'vite v8.0.14 building for production...' },
  { text: 'transforming...' },
  { text: '✓ 142 modules transformed.' },
  { text: 'rendering chunks (8)...' },
  { text: 'computing gzip size...' },
  { text: 'dist/index.html                     0.47 kB │ gzip:  0.30 kB' },
  { text: 'dist/assets/vendor-Cn4kPwQ7.js    142.04 kB │ gzip: 47.32 kB' },
  { text: 'dist/assets/index-Bz8RmYxL.js      67.21 kB │ gzip: 22.51 kB' },
  { text: 'dist/assets/index-DhE2qVoN.css      8.13 kB │ gzip:  2.04 kB' },
  { text: '' },
  { text: '✓ built in 2.34s' },
]

export function DecoyTerminal() {
  return (
    <div className="terminal">
      <div className="terminal__header">
        {PANEL_TABS.map((tab, i) => (
          <div
            key={tab}
            className={
              'terminal__tab' + (i === 3 ? ' terminal__tab--active' : '')
            }
          >
            {tab}
          </div>
        ))}
      </div>
      <div className="terminal__body">
        {LOG_LINES.map((line, i) => (
          <div key={i} className="terminal__line">
            {line.prompt ? (
              <>
                <span className="terminal__path">PS C:\dev\trust-me&gt; </span>
                <span>{line.text}</span>
              </>
            ) : (
              <span>{line.text || ' '}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
