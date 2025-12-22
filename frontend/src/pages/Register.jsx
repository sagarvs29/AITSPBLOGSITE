import React, { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Register() {
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const strength = useMemo(() => {
    const s = { len: password.length >= 8, digit: /\d/.test(password), upper: /[A-Z]/.test(password) }
    const score = Object.values(s).filter(Boolean).length
    return score >= 3 ? 'strong' : score === 2 ? 'medium' : 'weak'
  }, [password])

  const onRegister = async (e) => {
    e.preventDefault()
    const ok = await register(email, password, name)
    if (ok) navigate('/profile')
  }


  return (
    <div className="page container auth-wrap">
      <div className="card auth-card">
        <h2 style={{ marginTop: 0 }}>Create your account</h2>
        <form onSubmit={onRegister} className="auth-form">
          <label htmlFor="name">Name</label>
          <input id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />

          <label htmlFor="email">Email</label>
          <input id="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />

          <label htmlFor="password">Password</label>
          <input id="password" placeholder="At least 8 characters" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="auth-help">Strength: {strength} · Include uppercase and a number</div>

          <div className="actions">
            <button className="btn" disabled={loading} type="submit">{loading ? '...' : 'Create account'}</button>
            <Link to="/login" className="btn secondary">Login</Link>
          </div>
          {error && <div className="meta" style={{ color: 'var(--accent-red)' }}>{error}</div>}
        </form>
      </div>
    </div>
  )
}
