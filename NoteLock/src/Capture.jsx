import { useState } from 'react'
import './css/Capture.css'
import CameraPage from './CameraPage.jsx'
import { callGenerate } from './api'
import { setDraft } from './draftStore'

export default function Capture() {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  async function handleCapture(dataUrl, subjectId, subjectName) {
    setProcessing(true)
    setError('')
    try {
      const result = await callGenerate(dataUrl, subjectName ?? 'General')
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

  if (processing) {
    return (
      <main className="capture-page">
        <section className="capture-shell" aria-labelledby="capture-title">
          <h1 id="capture-title">Capture a slide</h1>
          <p className="capture-status">Reading the slide…</p>
        </section>
      </main>
    )
  }

  return (
    <CameraPage
      onCapture={handleCapture}
      onBack={() => { window.location.hash = '/' }}
      externalError={error}
    />
  )
}
