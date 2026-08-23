import { useState } from 'react'
import './css/Capture.css'
import CameraPage from './CameraPage.jsx'
import { callGenerate } from './api'
import { setDraft } from './draftStore'

export default function Capture({ mode = 'photo' }) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  async function handleCapture(capture, subjectId, subjectName) {
    setProcessing(true)
    setError('')
    try {
      const result = await callGenerate({
        imageDataUrl: capture.mode === 'photo' ? capture.dataUrl : null,
        audioDataUrl: capture.mode === 'audio' ? capture.dataUrl : null,
        subject: subjectName ?? 'General',
      })
      setDraft({
        subjectId: subjectId || null,
        mode: capture.mode,
        image: capture.mode === 'photo' ? capture.dataUrl : null,
        audio: capture.mode === 'audio' ? capture.dataUrl : null,
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
          <h1 id="capture-title">{mode === 'audio' ? 'Record your explanation' : 'Capture a slide'}</h1>
          <p className="capture-status">
            {mode === 'audio' ? 'Listening to the recording…' : 'Reading the slide…'}
          </p>
        </section>
      </main>
    )
  }

  return (
    <CameraPage
      mode={mode}
      onCapture={handleCapture}
      onBack={() => { window.location.hash = '/' }}
      externalError={error}
    />
  )
}
