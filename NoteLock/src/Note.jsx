import { useEffect, useState } from 'react'
import './css/Note.css'
import { getNote, updateNote } from './store'
import { getFormat } from './formats/index.js'

function buildEditForm(note) {
  return {
    title: note.title ?? '',
    topic: note.topic ?? '',
    tags: (note.tags ?? []).join(', '),
    content: structuredClone(note.content ?? {}),
  }
}

export default function Note({ id }) {
  const [note, setNote] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

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

  function startEditing() {
    setSaveError('')
    setForm(buildEditForm(note))
    setEditing(true)
  }

  function cancelEditing() {
    setForm(null)
    setSaveError('')
    setEditing(false)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
      const saved = await updateNote(note.id, {
        title: form.title.trim() || 'Untitled note',
        topic: form.topic.trim(),
        tags,
        content: form.content,
      })
      setNote(saved)
      setEditing(false)
      setForm(null)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function updateContent(updater) {
    setForm(f => ({ ...f, content: updater(f.content) }))
  }

  const rendered = !editing && format ? format.render(note.content) : null

  return (
    <main className="note-page">
      <section className="note-shell">
        <div className="note-header-row">
          <button className="note-back" type="button" aria-label="Back to home" onClick={() => { window.location.hash = '/' }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          </button>

          {!editing ? (
            <button className="note-edit-btn" type="button" onClick={startEditing}>
              Edit
            </button>
          ) : (
            <div className="note-edit-actions">
              <button className="note-cancel-btn" type="button" onClick={cancelEditing} disabled={saving}>
                Cancel
              </button>
              <button className="note-save-btn" type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {saveError && <p className="note-status note-error">{saveError}</p>}

        {!editing ? (
          <>
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
                    {rendered.rows.map((row, i) => (
                      <tr key={i}>
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
                {rendered.subtopics.map((sub, i) => (
                  <div className="note-subtopic" key={i}>
                    <h3>{sub.name}</h3>
                    <ul>
                      {sub.keyPoints.map((point, j) => <li key={j}>{point}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {rendered?.kind === 'list' && (
              <ol className="note-body note-list">
                {rendered.items.map((item, i) => <li key={i}>{item}</li>)}
              </ol>
            )}

            {!rendered && <p className="note-status">This note has no content yet.</p>}
          </>
        ) : (
          <NoteEditForm note={note} form={form} setForm={setForm} updateContent={updateContent} />
        )}
      </section>
    </main>
  )
}

function NoteEditForm({ note, form, setForm, updateContent }) {
  return (
    <div className="note-edit-form">
      <label className="note-field">
        Title
        <input
          type="text"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        />
      </label>

      <label className="note-field">
        Topic
        <input
          type="text"
          value={form.topic}
          onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
        />
      </label>

      <label className="note-field">
        Tags <span className="note-field-hint">comma separated</span>
        <input
          type="text"
          value={form.tags}
          onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
        />
      </label>

      {note.format_id === 'cornell' && (
        <CornellEditor content={form.content} updateContent={updateContent} />
      )}
      {note.format_id === 'outline' && (
        <OutlineEditor content={form.content} updateContent={updateContent} />
      )}
      {note.format_id === 'list' && (
        <ListEditor content={form.content} updateContent={updateContent} />
      )}
    </div>
  )
}

function CornellEditor({ content, updateContent }) {
  const rows = content.rows ?? []

  function setRow(i, field, value) {
    updateContent(c => ({
      ...c,
      rows: c.rows.map((row, ri) => ri === i ? { ...row, [field]: value } : row),
    }))
  }

  function addRow() {
    updateContent(c => ({ ...c, rows: [...c.rows, { keyword: '', mainPoint: '' }] }))
  }

  function removeRow(i) {
    if (rows.length <= 1) return
    updateContent(c => ({ ...c, rows: c.rows.filter((_, ri) => ri !== i) }))
  }

  return (
    <div className="note-edit-section">
      <p className="note-field-label">Rows</p>
      {rows.map((row, i) => (
        <div className="note-edit-row" key={i}>
          <input
            type="text"
            placeholder="Keyword"
            value={row.keyword}
            onChange={e => setRow(i, 'keyword', e.target.value)}
          />
          <input
            type="text"
            placeholder="Main point"
            value={row.mainPoint}
            onChange={e => setRow(i, 'mainPoint', e.target.value)}
          />
          <button type="button" className="note-remove-btn" aria-label="Remove row" onClick={() => removeRow(i)} disabled={rows.length <= 1}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className="note-add-btn" onClick={addRow}>+ Add row</button>

      <label className="note-field">
        Summary
        <textarea
          rows={4}
          value={content.summary ?? ''}
          onChange={e => updateContent(c => ({ ...c, summary: e.target.value }))}
        />
      </label>
    </div>
  )
}

function OutlineEditor({ content, updateContent }) {
  const subtopics = content.subtopics ?? []

  function setSubtopicName(i, value) {
    updateContent(c => ({
      ...c,
      subtopics: c.subtopics.map((sub, si) => si === i ? { ...sub, name: value } : sub),
    }))
  }

  function setKeyPoint(i, j, value) {
    updateContent(c => ({
      ...c,
      subtopics: c.subtopics.map((sub, si) => si === i
        ? { ...sub, keyPoints: sub.keyPoints.map((p, pi) => pi === j ? value : p) }
        : sub),
    }))
  }

  function addSubtopic() {
    updateContent(c => ({ ...c, subtopics: [...c.subtopics, { name: '', keyPoints: [''] }] }))
  }

  function removeSubtopic(i) {
    if (subtopics.length <= 1) return
    updateContent(c => ({ ...c, subtopics: c.subtopics.filter((_, si) => si !== i) }))
  }

  function addKeyPoint(i) {
    updateContent(c => ({
      ...c,
      subtopics: c.subtopics.map((sub, si) => si === i ? { ...sub, keyPoints: [...sub.keyPoints, ''] } : sub),
    }))
  }

  function removeKeyPoint(i, j) {
    updateContent(c => ({
      ...c,
      subtopics: c.subtopics.map((sub, si) => si === i
        ? (sub.keyPoints.length <= 1 ? sub : { ...sub, keyPoints: sub.keyPoints.filter((_, pi) => pi !== j) })
        : sub),
    }))
  }

  return (
    <div className="note-edit-section">
      <label className="note-field">
        Main topic
        <input
          type="text"
          value={content.mainTopic ?? ''}
          onChange={e => updateContent(c => ({ ...c, mainTopic: e.target.value }))}
        />
      </label>

      {subtopics.map((sub, i) => (
        <div className="note-edit-subtopic" key={i}>
          <div className="note-edit-row">
            <input
              type="text"
              placeholder="Subtopic name"
              value={sub.name}
              onChange={e => setSubtopicName(i, e.target.value)}
            />
            <button type="button" className="note-remove-btn" aria-label="Remove subtopic" onClick={() => removeSubtopic(i)} disabled={subtopics.length <= 1}>
              ×
            </button>
          </div>
          {sub.keyPoints.map((point, j) => (
            <div className="note-edit-row note-edit-row-nested" key={j}>
              <input
                type="text"
                placeholder="Key point"
                value={point}
                onChange={e => setKeyPoint(i, j, e.target.value)}
              />
              <button type="button" className="note-remove-btn" aria-label="Remove key point" onClick={() => removeKeyPoint(i, j)} disabled={sub.keyPoints.length <= 1}>
                ×
              </button>
            </div>
          ))}
          <button type="button" className="note-add-btn note-add-btn-nested" onClick={() => addKeyPoint(i)}>+ Add key point</button>
        </div>
      ))}
      <button type="button" className="note-add-btn" onClick={addSubtopic}>+ Add subtopic</button>
    </div>
  )
}

function ListEditor({ content, updateContent }) {
  const items = content.items ?? []

  function setItem(i, value) {
    updateContent(c => ({ ...c, items: c.items.map((item, ii) => ii === i ? value : item) }))
  }

  function addItem() {
    updateContent(c => ({ ...c, items: [...c.items, ''] }))
  }

  function removeItem(i) {
    if (items.length <= 1) return
    updateContent(c => ({ ...c, items: c.items.filter((_, ii) => ii !== i) }))
  }

  return (
    <div className="note-edit-section">
      <p className="note-field-label">Items</p>
      {items.map((item, i) => (
        <div className="note-edit-row" key={i}>
          <input
            type="text"
            placeholder={`Item ${i + 1}`}
            value={item}
            onChange={e => setItem(i, e.target.value)}
          />
          <button type="button" className="note-remove-btn" aria-label="Remove item" onClick={() => removeItem(i)} disabled={items.length <= 1}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className="note-add-btn" onClick={addItem}>+ Add item</button>
    </div>
  )
}
