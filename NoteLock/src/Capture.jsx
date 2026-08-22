import { useEffect, useState } from 'react'
import './css/Capture.css'
import CameraCapture from './CameraCapture.jsx'
import { getSubjects } from './store'
import { callGenerate } from './api'
import { setDraft } from './draftStore'

export default function Capture() {
  const [subjects, setSubjects] = useState([])
  const [subjectId, setSubjectId] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSubjects().then(setSubjects).catch(err => setError(err.message))
  }, [])

  async function handleCapture(dataUrl) {
    setProcessing(true)
    setError('')
    try {
      const subject = subjects.find(s => s.id === subjectId)
      const result = await callGenerate(dataUrl, subject?.name ?? 'General')
      setDraft({
        subjectId: subjectId || null,
        image: dataUrl,
        topic: result.topic,
        title: result.title,
        tags: result.tags,
        questions: result.questions,
      })
      window.location.hash = '/mcq'
    } catch (err) {
      setError(err.message)
      setProcessing(false)
    }
  }

  return (
    <main className="capture-page">
      <section className="capture-shell" aria-labelledby="capture-title">
        <button className="capture-back" type="button" aria-label="Go back to homepage" onClick={() => { window.location.hash = '/' }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
        </button>

        <h1 id="capture-title">Capture a slide</h1>

        <label className="capture-subject">
          Subject
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)} disabled={processing}>
            <option value="">No subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
        </label>

        {error && <p className="capture-status capture-error">{error}</p>}

        {processing ? (
          <p className="capture-status">Reading the slide…</p>
        ) : (
          <div className="capture-camera">
            <CameraCapture onCapture={handleCapture} />
          </div>
        )}
      </section>
    </main>
  )
}
