import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) { setUser(null); return }
    ;(async () => {
      try {
        const me = await api.get('/api/auth/me', { token })
        setUser(me.data)
      } catch (err) {
        console.warn('Failed to fetch me', err)
        setUser(null)
      }
    })()
  }, [token])

  const login = async (email, password) => {
    setLoading(true); setError('')
    try {
      const res = await api.post('/api/auth/login', { email, password })
      setToken(res.data.token)
      localStorage.setItem('token', res.data.token)
      const me = await api.get('/api/auth/me', { token: res.data.token })
      setUser(me.data)
      return true
    } catch (err) {
      setError(err.message); return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password, name) => {
    setLoading(true); setError('')
    try {
      // Register now creates account and returns a token (no email verification)
      const res = await api.post('/api/auth/register', { email, password, name })
      const t = res.data?.token
      if (t) {
        setToken(t)
        localStorage.setItem('token', t)
        // fetch me
        const me = await api.get('/api/auth/me', { token: t })
        setUser(me.data)
      }
      return true
    } catch (err) {
      setError(err.message); return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthCtx.Provider value={{ token, user, loading, error, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}
