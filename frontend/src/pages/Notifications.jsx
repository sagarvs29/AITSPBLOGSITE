import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { api } from '../api'

export default function Notifications() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [message, setMessage] = useState('')

  const load = async () => {
    try {
      const res = await api.get('/api/notifications?page=1&limit=50', { token })
      setItems(res.data.items || [])
    } catch (err) {
      setMessage(err.message)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="page">
      <h2>Notifications</h2>
      {message && <div style={{ color: 'red' }}>{message}</div>}
      <ul className="list">
        {items.map((n) => (
          <li key={n._id} className="card">
            <div style={{ fontWeight: 600 }}>{n.type === 'POST_DELETED' ? 'Post removed by admin' : n.type}</div>
            {n.message && <div className="muted">{n.message}</div>}
            {n.reason && <div className="mt-2"><b>Reason:</b> {n.reason}</div>}
            {n.postId && <div className="mt-2 meta">Post ID: {n.postId}</div>}
            <div className="meta mt-2">{new Date(n.createdAt).toLocaleString()}</div>
          </li>
        ))}
        {items.length === 0 && <div className="muted">No notifications</div>}
      </ul>
    </div>
  )
}
