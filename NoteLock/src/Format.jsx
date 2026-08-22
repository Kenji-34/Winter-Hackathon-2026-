import { useState } from 'react'
import './css/Format.css'
import { getDraft, clearDraft } from './draftStore'
import { callGenerateNote } from './api'
import { addNote, unlockNote, uploadSlide, getSubjects } from './store'

async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl)
  return res.blob()
}

export default function Format() {
  const draft = getDraft()
  const [selectedFormat, setSelectedFormat] = useState(null)
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
    if (!selectedFormat || !image) return
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

      const content = await callGenerateNote(image, selectedFormat)
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
        formatId: selectedFormat,
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
        <button className="format-back" type="button" aria-label="Go back to quiz result" onClick={() => { window.location.hash = '/result' }}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </button>

        <h1 id="format-title">Choose a note format</h1>

        {!draft?.image && (
          <label className="format-temp-image">
            No captured image yet (Capture screen isn't wired in) — attach one to test:
            <input type="file" accept="image/*" onChange={handleTempImage} />
          </label>
        )}

        <div className="format-picker">
          <div className="format-option">
            <button
              className={`format-card cornell-card${selectedFormat === 'cornell' ? ' selected' : ''}`}
              type="button"
              aria-pressed={selectedFormat === 'cornell'}
              onClick={() => setSelectedFormat('cornell')}
            >
              <span className="cornell-title">Title</span>
              <span className="cornell-table">
                <span className="cornell-keyword">Keyword</span>
                <span className="cornell-point">Main Point A</span>
                <span className="cornell-keyword">Keyword</span>
                <span className="cornell-point">Main Point B</span>
                <span className="cornell-keyword">Keyword</span>
                <span className="cornell-point">Main Point C</span>
              </span>
              <span className="cornell-summary">Summary</span>
            </button>
            <span className="format-name">Cornell</span>
          </div>

          <div className="format-option">
            <button
              className={`format-card numbered-card${selectedFormat === 'list' ? ' selected' : ''}`}
              type="button"
              aria-pressed={selectedFormat === 'list'}
              onClick={() => setSelectedFormat('list')}
            >
              <ol>
                <li>Water and land make up the surface of our planet.</li>
                <li>Small cells make up all living things on Earth.</li>
                <li>I need to make up for lost time by working fast today.</li>
                <li>He runs every morning to train for the marathon.</li>
              </ol>
            </button>
            <span className="format-name">List</span>
          </div>

          <div className="format-option">
            <button
              className={`format-card outline-card${selectedFormat === 'outline' ? ' selected' : ''}`}
              type="button"
              aria-pressed={selectedFormat === 'outline'}
              onClick={() => setSelectedFormat('outline')}
            >
              <strong>Main Topic A</strong>
              <ul>
                <li>Sub Topic A
                  <ul><li>Key Point A</li><li>Key Point B</li><li>Key Point C</li></ul>
                </li>
                <li>Sub Topic B
                  <ul><li>Key Point A</li><li>Key Point B</li><li>Key Point C</li></ul>
                </li>
                <li>Sub Topic C
                  <ul><li>Key Point A</li><li>Key Point B</li></ul>
                </li>
              </ul>
            </button>
            <span className="format-name">Outline</span>
          </div>
        </div>

        {error && <p className="format-status format-error">{error}</p>}

        <button
          className="format-generate"
          type="button"
          disabled={!selectedFormat || !image || loading}
          onClick={handleConfirm}
        >
          {loading ? 'Generating your note…' : 'Generate'}
        </button>
      </section>
    </main>
  )
}
