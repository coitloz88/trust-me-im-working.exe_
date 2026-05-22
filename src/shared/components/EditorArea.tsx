const LINE_COUNT = 32

export function EditorArea() {
  return (
    <div className="editor">
      <div className="editor__gutter">
        {Array.from({ length: LINE_COUNT }, (_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>
      <div className="editor__content" />
    </div>
  )
}
