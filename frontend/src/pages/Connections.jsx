import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { api } from '../api'

export default function Connections() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [message, setMessage] = useState('')

  const load = async () => {
    try {
      const res = await api.get('/api/users/connections', { token })
      setItems(res.data.items || [])
    } catch (err) {
      setMessage(err.message)
    }
  }

  useEffect(() => { load() }, [])

  const remove = async (id) => {
    try {
      await api.delete(`/api/users/${id}/connect`)
      setItems((list) => list.filter((x) => x._id !== id))
    } catch (err) { setMessage(err.message) }
  }

  return (
    <div>
      <h2>My Connections</h2>
      {message && <div style={{ color: 'red' }}>{message}</div>}
      <ul>
        {items.map((m) => (
          <li key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{m.profile?.name || m.email}</span>
            <span style={{ color: '#666' }}>{m.email}</span>
            <button onClick={() => remove(m._id)} style={{ marginLeft: 'auto' }}>Remove</button>
          </li>
        ))}
        {items.length === 0 && <div>No connections yet</div>}
      </ul>
    </div>
  )
}
