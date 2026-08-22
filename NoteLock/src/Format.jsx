import { useState } from 'react'
import './css/Format.css'

export default function Format() {
  const [selectedFormat, setSelectedFormat] = useState(null)

  return (
    <main className="format-page">
      <section className="format-shell" aria-label="Choose a note format">
        <button className="format-back" type="button" aria-label="Go back to quiz result" onClick={() => { window.location.hash = '/result' }}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </button>

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
              className={`format-card numbered-card${selectedFormat === 'numbered' ? ' selected' : ''}`}
              type="button"
              aria-pressed={selectedFormat === 'numbered'}
              onClick={() => setSelectedFormat('numbered')}
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

        <button className="format-generate" type="button">Generate</button>
      </section>
    </main>
  )
}
