import { useState } from 'react'
import './css/Auth.css'
import { useAuth, signIn, signUp } from './AuthContext'
import Router from './Router'

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
    <div className="auth-card">
      <img src="/logo.png" alt="NoteLock logo" className="auth-logo" />
      <h1 className="auth-title"><span>Note</span> Lock</h1>
      <p className="auth-tagline">Retrieve before you receive.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label">
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className="auth-label">
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
        </label>
        {error && <p className="auth-error">{error}</p>}
        {notice && <p className="auth-notice">{notice}</p>}
        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>
      <button className="auth-toggle" onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); setNotice('') }}>
        {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </button>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="auth-page"><p className="auth-loading">Loading…</p></div>
  )

  if (!user) return (
    <div className="auth-page"><AuthForm /></div>
  )

  return <Router />
}
