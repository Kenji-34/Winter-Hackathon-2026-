import { useState } from 'react'
import { useAuth, signIn, signUp, signOut } from './AuthContext'
import CameraCapture from './CameraCapture'

const s = {
  page: { minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f9fafb' },
  card: { width: '100%', maxWidth: 380, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 32, display: 'flex', flexDirection: 'column', gap: 20 },
  h1: { margin: 0, fontSize: 22, fontWeight: 700, color: '#111827', textAlign: 'center' },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500, color: '#374151' },
  input: { padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' },
  btn: { padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, background: '#111827', color: '#fff' },
  toggle: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', textAlign: 'center', padding: 0 },
  error: { fontSize: 13, color: '#ef4444', textAlign: 'center', margin: 0 },
  notice: { fontSize: 13, color: '#22c55e', textAlign: 'center', margin: 0 },
  email: { margin: 0, fontSize: 14, color: '#6b7280' },
  name: { margin: 0, fontSize: 18, fontWeight: 600, color: '#111827' },
  signedCard: { width: '100%', maxWidth: 380, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  outBtn: { padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: 14, background: '#fff', color: '#374151' },
}

function AuthForm() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    const { error } = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password)

    setLoading(false)

    if (error) {
      setError(error.message)
    } else if (mode === 'signup') {
      setNotice('Check your email to confirm your account.')
    }
  }

  return (
    <div style={s.card}>
      <h1 style={s.h1}>Note Lock</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={s.label}>
          Email
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label style={s.label}>
          Password
          <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
        </label>
        {error && <p style={s.error}>{error}</p>}
        {notice && <p style={s.notice}>{notice}</p>}
        <button style={s.btn} type="submit" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>
      <button style={s.toggle} onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); setNotice('') }}>
        {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </button>
      <CameraCapture onCapture={(dataUrl) => {
        console.log('Captured Image:', dataUrl.slice(0, 50) + '...')
      }} />
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={s.page}><p style={{ color: '#9ca3af' }}>Loading…</p></div>
  )

  if (!user) return (
    <div style={s.page}><AuthForm /></div>
  )

  return (
    <div style={s.page}>
      <div style={s.signedCard}>
        <h1 style={s.h1}>Note Lock</h1>
        <p style={s.name}>Welcome back</p>
        <p style={s.email}>{user.email}</p>
        <button style={s.outBtn} onClick={signOut}>Sign out</button>
      </div>
    </div>
  )
}
