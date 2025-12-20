import React, { useMemo, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useAuth } from '../auth/AuthContext'

export default function Register() {
  const { register, verifyOtp, loading, error } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('REGISTER') // REGISTER | VERIFY
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [otpBoxes, setOtpBoxes] = useState(Array(6).fill(''))
  const otpRefs = useRef([])

  const strength = useMemo(() => {
    const s = { len: password.length >= 8, digit: /\d/.test(password), upper: /[A-Z]/.test(password) }
    const score = Object.values(s).filter(Boolean).length
    return score >= 3 ? 'strong' : score === 2 ? 'medium' : 'weak'
  }, [password])

  const onRegister = async (e) => {
    e.preventDefault()
    const ok = await register(email, password, name)
    if (ok) setStep('VERIFY')
  }

  const onVerify = async (e) => {
    e.preventDefault()
    const code = otpBoxes.join('')
    if (code.length !== 6) return
    const ok = await verifyOtp(email, code)
    if (ok) navigate('/profile')
  }

  // OTP segmented boxes handlers
  const handleBoxChange = (idx, raw) => {
    const val = raw.replace(/\D/g, '').slice(0, 1)
    setOtpBoxes((prev) => {
      const next = [...prev]
      next[idx] = val
      return next
    })
    if (val && idx < 5) {
      otpRefs.current[idx + 1]?.focus()
    }
  }

  const handleBoxKeyDown = (idx, e) => {
    const key = e.key
    if (key === 'Backspace') {
      e.preventDefault()
      setOtpBoxes((prev) => {
        const next = [...prev]
        if (next[idx]) {
          next[idx] = ''
        } else if (idx > 0) {
          next[idx - 1] = ''
          otpRefs.current[idx - 1]?.focus()
        }
        return next
      })
      return
    }
    if (key === 'ArrowLeft' && idx > 0) {
      e.preventDefault()
      otpRefs.current[idx - 1]?.focus()
      return
    }
    if (key === 'ArrowRight' && idx < 5) {
      e.preventDefault()
      otpRefs.current[idx + 1]?.focus()
      return
    }
    if (key === 'Enter') {
      const code = otpBoxes.join('')
      if (code.length === 6) {
        onVerify(e)
      }
    }
  }

  const handleBoxPaste = (idx, e) => {
    e.preventDefault()
    const text = (e.clipboardData || window.clipboardData)?.getData('text') || ''
    const digits = text.replace(/\D/g, '').slice(0, 6 - idx).split('')
    if (digits.length === 0) return
    setOtpBoxes((prev) => {
      const next = [...prev]
      for (let i = 0; i < digits.length; i++) {
        next[idx + i] = digits[i]
      }
      return next
    })
    const nextIndex = Math.min(idx + digits.length, 5)
    otpRefs.current[nextIndex]?.focus()
  }

  if (step === 'VERIFY') {
    return (
      <div className="page container">
        <div style={{ marginBottom: 12 }}>
          <BackButton fallback="/register" />
        </div>
        <div className="memo" style={{ maxWidth: 520, margin: '0 auto' }}>
          <h3>Verification Notice</h3>
          <p className="meta">We dispatched a six-digit code to {email}. Enter it below to confirm your identity.</p>
          <form onSubmit={onVerify} style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
            <div className="otp-grid" role="group" aria-label="One-time passcode">
              {otpBoxes.map((val, i) => (
                <input
                  key={i}
                  className="otp-box"
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  aria-label={`Digit ${i + 1}`}
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleBoxChange(i, e.target.value)}
                  onKeyDown={(e) => handleBoxKeyDown(i, e)}
                  onPaste={(e) => handleBoxPaste(i, e)}
                  ref={(el) => (otpRefs.current[i] = el)}
                  required
                />
              ))}
            </div>
            <div className="actions">
              <button className="btn" disabled={loading} type="submit">{loading ? '...' : 'Verify & Login'}</button>
              <button className="btn secondary" type="button" onClick={() => setStep('REGISTER')}>Change email</button>
            </div>
            {error && <div className="meta" style={{ color: 'var(--accent-red)' }}>{error}</div>}
          </form>
          <div className="meta mt-2">Tip: Check your spam folder. Codes typically expire in 10 minutes.</div>
        </div>
      </div>
    )
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
