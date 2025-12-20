import React, { useState } from 'react'
import { api } from '../api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setMessage('')
    try {
      await api.post('/api/auth/reset/request', { email })
      setMessage('If the email exists, a reset message was sent. In dev, check backend logs for the Ethereal preview URL.')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? '...' : 'Send reset link'}</button>
      </form>
      {message && <div style={{ marginTop: 8 }}>{message}</div>}
    </div>
  )
}
