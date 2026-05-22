const PANEL_TABS = ['Problems', 'Output', 'Debug Console', 'Terminal', 'Ports']

const LOG_LINES = [
  { prompt: true, text: 'pnpm dev' },
  { text: '' },
  { text: '> trust-me-im-working.exe_@0.0.0 dev' },
  { text: '> vite' },
  { text: '' },
  { text: '  VITE v8.0.12  ready in 423 ms' },
  { text: '' },
  { text: '  ➜  Local:   http://localhost:5173/' },
  { text: '  ➜  Network: use --host to expose' },
  { text: '  ➜  press h + enter to show help' },
]

type Props = { hidden?: boolean }

export function Terminal({ hidden }: Props) {
  return (
    <div className="terminal" style={hidden ? { display: 'none' } : undefined}>
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
            {line.prompt && (
              <>
                <span className="terminal__path">PS C:\dev\trust-me&gt; </span>
                <span>{line.text}</span>
              </>
            )}
            {!line.prompt && <span>{line.text || ' '}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
