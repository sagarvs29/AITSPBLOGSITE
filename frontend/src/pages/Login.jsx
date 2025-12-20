import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) navigate('/posts')
  }

  return (
    <div className="page container auth-wrap">
      <div className="card auth-card">
        <h2 style={{ marginTop: 0 }}>Welcome back</h2>
        <form onSubmit={onSubmit} className="auth-form">
          <label htmlFor="email">Email</label>
          <input id="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />

          <label htmlFor="password">Password</label>
          <input id="password" placeholder="Enter your password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <div className="actions">
            <button className="btn" disabled={loading} type="submit">{loading ? '…' : 'Login'}</button>
            <Link to="/register" className="btn secondary">Register</Link>
          </div>
          {error && <div className="meta" style={{ color: 'var(--accent-red)' }}>{error}</div>}
        </form>
        <div className="mt-2">
          <a href="/forgot">Forgot password?</a>
        </div>
      </div>
    </div>
  )
}
