import { useEffect, useState } from 'react'
import './css/Note.css'
import { getNote } from './store'
import { getFormat } from './formats/index.js'

export default function Note({ id }) {
  const [note, setNote] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getNote(id)
      .then(data => { if (!cancelled) setNote(data) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) return <main className="note-page"><p className="note-status">Loading…</p></main>
  if (error) return <main className="note-page"><p className="note-status note-error">{error}</p></main>
  if (!note) return null

  const format = getFormat(note.format_id)
  const rendered = format ? format.render(note.content) : null

  return (
    <main className="note-page">
      <section className="note-shell">
        <button className="note-back" type="button" aria-label="Back to home" onClick={() => { window.location.hash = '/' }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
        </button>

        <h1>{note.title}</h1>
        <p className="note-topic">{note.topic}</p>
        {note.tags?.length > 0 && (
          <div className="note-tags">
            {note.tags.map(tag => <span className="note-chip" key={tag}>{tag}</span>)}
          </div>
        )}

        {rendered?.kind === 'cornell' && (
          <div className="note-body">
            <table className="note-cornell-table">
              <tbody>
                {rendered.rows.map(row => (
                  <tr key={row.keyword}>
                    <th>{row.keyword}</th>
                    <td>{row.mainPoint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="note-summary">{rendered.summary}</p>
          </div>
        )}

        {rendered?.kind === 'outline' && (
          <div className="note-body">
            <h2>{rendered.mainTopic}</h2>
            {rendered.subtopics.map(sub => (
              <div className="note-subtopic" key={sub.name}>
                <h3>{sub.name}</h3>
                <ul>
                  {sub.keyPoints.map(point => <li key={point}>{point}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {rendered?.kind === 'list' && (
          <ol className="note-body note-list">
            {rendered.items.map(item => <li key={item}>{item}</li>)}
          </ol>
        )}

        {!rendered && <p className="note-status">This note has no content yet.</p>}
      </section>
    </main>
  )
}
