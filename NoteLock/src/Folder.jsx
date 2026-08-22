import { useEffect, useState } from 'react'
import './css/Folder.css'
import { getSubjects, getNotes } from './store'

export default function Folder({ subjectId }) {
  const [subject, setSubject] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([getSubjects(), getNotes(subjectId)])
      .then(([subjects, notesData]) => {
        if (cancelled) return
        setSubject(subjects.find(s => s.id === subjectId) ?? null)
        setNotes(notesData)
      })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [subjectId])

  return (
    <main className="folder-page">
      <section className="folder-shell">
        <button className="folder-back" type="button" aria-label="Back to home" onClick={() => { window.location.hash = '/' }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
        </button>

        <h1>{subject?.name ?? 'Folder'}</h1>

        {loading && <p className="folder-status">Loading…</p>}
        {error && <p className="folder-status folder-error">{error}</p>}
        {!loading && !error && notes.length === 0 && (
          <p className="folder-status">No notes yet — hit the camera.</p>
        )}

        {!loading && notes.length > 0 && (
          <ul className="folder-notes">
            {notes.map(note => (
              <li key={note.id}>
                <button
                  className="folder-note-row"
                  type="button"
                  onClick={() => {
                    // TEMP: locked notes fall back to the generic quiz — it
                    // isn't wired to a specific note's questions yet.
                    window.location.hash = note.unlocked ? `/note/${note.id}` : '/mcq'
                  }}
                >
                  <span className="folder-note-info">
                    <span className="folder-note-title">{note.title}</span>
                    <span className="folder-note-meta">{note.topic} · {new Date(note.created_at).toLocaleDateString()}</span>
                  </span>
                  {!note.unlocked && <span className="folder-lock-badge" aria-label="Locked">🔒</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
