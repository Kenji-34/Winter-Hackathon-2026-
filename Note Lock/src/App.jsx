import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const s = {
  page: { minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24 },
  h1: { margin: 0, fontSize: 22, fontWeight: 700, textAlign: 'center', color: '#111827' },
  section: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af' },
  row: { display: 'flex', alignItems: 'flex-start', gap: 12, border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff' },
  icon: (ok, pending) => ({ fontWeight: 700, marginTop: 1, color: pending ? '#d1d5db' : ok ? '#22c55e' : '#ef4444' }),
  name: { fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#374151' },
  value: { fontFamily: 'monospace', fontSize: 12, color: '#6b7280', wordBreak: 'break-all' },
}

function StatusRow({ label, value, ok, pending }) {
  return (
    <div style={s.row}>
      <span style={s.icon(ok, pending)}>{pending ? '…' : ok ? '✓' : '✗'}</span>
      <div>
        <div style={s.name}>{label}</div>
        <div style={s.value}>{value}</div>
      </div>
    </div>
  )
}

export default function App() {
  const [db, setDb] = useState(null)
  const [api, setApi] = useState(null)

  useEffect(() => {
    supabase
      .from('subjects')
      .select('*')
      .then(({ data, error }) =>
        setDb(error
          ? { ok: false, message: error.message }
          : { ok: true, message: `${data.length} row(s) returned` }
        )
      )

    fetch('/api/generate')
      .then((r) => r.json())
      .then((json) => setApi({ ok: json.ok, message: JSON.stringify(json) }))
      .catch((err) => setApi({ ok: false, message: err.message }))
  }, [])

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.h1}>Note Lock — Diagnostics</h1>

        <div style={s.section}>
          <div style={s.label}>Supabase</div>
          <StatusRow
            label="supabase.from('subjects').select('*')"
            value={db?.message ?? 'connecting…'}
            ok={db?.ok}
            pending={!db}
          />
        </div>

        <div style={s.section}>
          <div style={s.label}>Serverless API</div>
          <StatusRow
            label="GET /api/generate"
            value={api?.message ?? 'fetching…'}
            ok={api?.ok}
            pending={!api}
          />
        </div>
      </div>
    </div>
  )
}
