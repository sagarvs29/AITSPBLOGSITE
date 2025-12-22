import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext'

export default function Directory() {
  const { token, user } = useAuth()
  const [search, setSearch] = useState('')
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [connections, setConnections] = useState([])

  const load = async () => {
    const res = await api.get(`/api/users/directory?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`)
    setItems(res.data.items || [])
    setTotal(res.data.total || 0)
  }

  const loadConnections = async () => {
    if (!token) return setConnections([])
    try {
      const res = await api.get('/api/users/connections', { token })
      setConnections((res.data.items || []).map((x) => x._id))
    } catch {}
  }

  useEffect(() => { load(); loadConnections() }, [page, limit])

  const connect = async (id) => {
    try {
      await api.post(`/api/users/${id}/connect`, {}, { token })
      setConnections((list) => [...list, id])
    } catch {}
  }

  const disconnect = async (id) => {
    try {
      await api.delete(`/api/users/${id}/connect`)
      setConnections((list) => list.filter((x) => x !== id))
    } catch {}
  }

  return (
    <div className="page container">
      <div className="broadside">
        <aside className="index" />
        <main className="frontpage" style={{ gridColumn: '2 / span 2' }}>
          <h2>Members</h2>
          <ul className="member-list">
            {items.map((m) => {
              const isMe = user && user.email === m.email
              const isConn = connections.includes(m._id)
              return (
                <li key={m._id} className="member-item">
                  <Link to={`/users/${m._id}`} className="member-name">{m.profile?.name || m.email}</Link>
                  <span className="muted">{m.profile?.bio ? ` — ${m.profile.bio}` : ''}</span>
                  {token && !isMe && (
                    isConn ? (
                      <button className="btn" onClick={() => disconnect(m._id)} style={{ marginLeft: 'auto' }}>Disconnect</button>
                    ) : (
                      <button className="btn" onClick={() => connect(m._id)} style={{ marginLeft: 'auto' }}>Connect</button>
                    )
                  )}
                </li>
              )
            })}
          </ul>
        </main>
        <aside className="ledger">
          <div className="search-bar">
            <input placeholder="Search name/bio" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn" onClick={() => { setPage(1); load() }}>Search</button>
          </div>
          <div className="actions mt-3" style={{ display: 'grid', gap: 8 }}>
            <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span className="meta" style={{ textAlign: 'center' }}>Page {page}</span>
            <button className="btn" disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </aside>
      </div>
    </div>
  )
}
