import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext'
import BackButton from '../components/BackButton'

export default function PublicProfile() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [isConn, setIsConn] = useState(false)
  const [connBusy, setConnBusy] = useState(false)

  const isMe = user && String(user.id) === String(id)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/api/users/${id}`, { token })
      setProfile(res.data)
    } catch (e) {
      setError(e.message || 'Unable to load profile')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const loadConn = async () => {
    if (!token) return setIsConn(false)
    try {
      const res = await api.get('/api/users/connections', { token })
      const ids = (res.data.items || []).map((x) => String(x._id))
      setIsConn(ids.includes(String(id)))
    } catch {
      setIsConn(false)
    }
  }

  useEffect(() => { load(); loadConn() }, [id])

  const connect = async () => {
    if (!token || isMe) return
    setConnBusy(true)
    try {
      await api.post(`/api/users/${id}/connect`, {}, { token })
      setIsConn(true)
      // After connecting, re-try loading in case visibility was CONNECTIONS
      if (!profile) await load()
    } catch (e) {
      // swallow
    } finally {
      setConnBusy(false)
    }
  }

  const disconnect = async () => {
    if (!token || isMe) return
    setConnBusy(true)
    try {
      await api.delete(`/api/users/${id}/connect`)
      setIsConn(false)
    } catch (e) {
      // swallow
    } finally {
      setConnBusy(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <BackButton />
      </div>
      {loading && <div>Loading…</div>}
      {!loading && error && (
        <div>
          <h2>Profile</h2>
          <div style={{ color: 'gray' }}>{error}</div>
          {token && !isMe && (
            isConn ? (
              <button onClick={disconnect} disabled={connBusy} style={{ marginTop: 12 }}>Disconnect</button>
            ) : (
              <button onClick={connect} disabled={connBusy} style={{ marginTop: 12 }}>Connect</button>
            )
          )}
        </div>
      )}

      {!loading && profile && (
        <div>
          <h2>{profile?.profile?.name || profile?.email}</h2>
          {profile?.profile?.photoUrl && (
            <img src={profile.profile.photoUrl} alt="avatar" style={{ width: 96, height: 96, borderRadius: 8, objectFit: 'cover' }} />
          )}
          {profile?.profile?.bio && <p style={{ marginTop: 8 }}>{profile.profile.bio}</p>}
          <div style={{ marginTop: 8, color: 'gray' }}>
            Visibility: {String(profile?.profile?.visibility || 'PUBLIC')}
          </div>
          <div style={{ marginTop: 8, color: 'gray' }}>Email: {profile?.email}</div>

          {token && !isMe && (
            isConn ? (
              <button onClick={disconnect} disabled={connBusy} style={{ marginTop: 12 }}>Disconnect</button>
            ) : (
              <button onClick={connect} disabled={connBusy} style={{ marginTop: 12 }}>Connect</button>
            )
          )}
        </div>
      )}
    </div>
  )
}
