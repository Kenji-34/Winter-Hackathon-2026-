import React from 'react'
import './css/Homepage.css'

const folders = [
  '#909090',
  '#23C55D',
  '#FFD78A',
  '#B4E24A',
  '#FF6B91',
  '#8A6CFF',
  '#23C55D',
  '#23C55D',
]

export default function Homepage() {
  return (
    <div className="phone-frame">
      <div className="home-root">
      <header className="home-header">
        <h1>Home</h1>
        <button className="add-btn" aria-label="Add folder">+</button>
      </header>

      <main className="folders-grid">
        {folders.map((color, i) => (
          <div className="folder" key={i}>
            <div className="folder-tab" style={{ background: color }} />
            <div className="folder-card" />
            <div className="folder-swatch" style={{ background: color }} />
            <div className="folder-notes">3 notes</div>
            <div className="folder-title">Folder</div>
          </div>
        ))}
      </main>

      <nav className="tabbar" role="navigation" aria-label="Bottom navigation">
        <button className="tab-icon home" aria-label="Home">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3 11.5L12 4l9 7.5" />
            <path d="M5 11.5v7a1 1 0 0 0 1 1h3v-5h6v5h3a1 1 0 0 0 1-1v-7" />
          </svg>
        </button>

        <button className="tab-icon camera" aria-label="Camera">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect x="3" y="7" width="18" height="12" rx="1" ry="1" />
            <path d="M8 7l1.2-2h5.6L16 7" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </button>

        <button className="tab-icon" aria-label="Menu">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>
      </nav>
      </div>
    </div>
  )
}
