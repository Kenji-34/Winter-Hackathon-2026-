import { useState } from 'react'
import './css/Format.css'
import { formats } from './formats/index.js'
import { getDraft, clearDraft } from './draftStore'
import { callGenerateNote } from './api'
import { addNote, unlockNote, uploadSlide, getSubjects } from './store'

async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl)
  return res.blob()
}

export default function Format() {
  const draft = getDraft()
  const [selectedId, setSelectedId] = useState(null)
  const [tempImage, setTempImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const image = draft?.image ?? tempImage

  function handleTempImage(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setTempImage(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleConfirm() {
    if (!selectedId || !image) return
    setLoading(true)
    setError('')
    try {
      let subjectId = draft?.subjectId
      if (!subjectId) {
        // TEMP: no subject context until Capture.jsx supplies one — defaults to the first folder
        const subjects = await getSubjects()
        if (subjects.length === 0) {
          throw new Error('Create a folder on Home first — there\'s no subject to save this note under.')
        }
        subjectId = subjects[0].id
      }

      const content = await callGenerateNote(image, selectedId)
      const blob = await dataUrlToBlob(image)
      const imageUrl = await uploadSlide(blob)

      const note = await addNote({
        subjectId,
        title: draft?.title ?? 'Untitled note',
        topic: draft?.topic ?? '',
        tags: draft?.tags ?? [],
        content,
        questions: draft?.questions ?? [],
        imageUrl,
        formatId: selectedId,
      })
      await unlockNote(note.id)

      clearDraft()
      window.location.hash = `/note/${note.id}`
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="format-page">
      <section className="format-shell" aria-labelledby="format-title">
        <button className="format-back" type="button" aria-label="Go back to homepage" onClick={() => { window.location.hash = '/' }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
        </button>

        <h1 id="format-title">Choose a format</h1>
        <p className="format-subtitle">Pick how this note gets written up — locked in once you confirm.</p>

        {!draft?.image && (
          <label className="format-temp-image">
            No captured image yet (Capture screen isn't wired in) — attach one to test:
            <input type="file" accept="image/*" onChange={handleTempImage} />
          </label>
        )}

        <div className="format-options" role="radiogroup" aria-label="Note format">
          {formats.map(format => (
            <button
              key={format.id}
              type="button"
              role="radio"
              aria-checked={selectedId === format.id}
              className={`format-card${selectedId === format.id ? ' selected' : ''}`}
              onClick={() => setSelectedId(format.id)}
            >
              <span className="format-card-name">{format.name}</span>
            </button>
          ))}
        </div>

        {error && <p className="format-status format-error">{error}</p>}

        <button className="format-submit" type="button" disabled={!selectedId || !image || loading} onClick={handleConfirm}>
          {loading ? 'Generating your note…' : 'Confirm'}
        </button>
      </section>
    </main>
  )
}
