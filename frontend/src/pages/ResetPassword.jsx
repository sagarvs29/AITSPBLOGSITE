import React, { useState } from 'react'
import { api } from '../api'

export default function ResetPassword() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setMessage('')
    try {
      await api.post('/api/auth/reset/confirm', { token, newPassword: password })
      setMessage('Password updated. You can now login with your new password.')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} />
        <input placeholder="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? '...' : 'Reset'}</button>
      </form>
      {message && <div style={{ marginTop: 8 }}>{message}</div>}
    </div>
  )
}
