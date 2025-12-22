import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { api } from '../api'
import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton'

export default function Admin() {
  const { token, user } = useAuth()
  const [pending, setPending] = useState([])
  const [published, setPublished] = useState([])
  const [message, setMessage] = useState('')
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [deleteMemo, setDeleteMemo] = useState({ id: null, reason: '' })

  const loadPending = async () => {
    try {
      const res = await api.get('/api/admin/posts?status=pending&page=1&limit=20', { token })
      setPending(res.data.items || [])
    } catch (err) {
      setMessage(err.message)
    }
  }

  const loadPublished = async () => {
    try {
      const res = await api.get('/api/admin/posts?status=published&page=1&limit=20', { token })
      setPublished(res.data.items || [])
    } catch (err) {
      setMessage(err.message)
    }
  }

  const loadMembers = async () => {
    try {
      const res = await api.get(`/api/admin/users?q=${encodeURIComponent(search)}&page=1&limit=20`, { token })
      setMembers(res.data.items || [])
    } catch (err) {
      setMessage(err.message)
    }
  }

  useEffect(() => { loadPending(); loadPublished(); loadMembers(); }, [])

  const approve = async (id) => {
    try {
      await api.post(`/api/posts/${id}/approve`, {}, { token })
      setPending((list) => list.filter((p) => p._id !== id))
    } catch (err) {
      setMessage(err.message)
    }
  }

  const deletePostAdmin = (id) => {
    setDeleteMemo({ id, reason: '' })
  }

  const confirmDelete = async () => {
    const { id, reason } = deleteMemo
    if (!id || !reason.trim()) return
    try {
      await api.delete(`/api/admin/posts/${id}`, { data: { reason } })
      setPending((list) => list.filter((p) => p._id !== id))
      setPublished((list) => list.filter((p) => p._id !== id))
      setDeleteMemo({ id: null, reason: '' })
    } catch (err) {
      setMessage(err.message)
    }
  }

  const viewMember = async (id) => {
    try {
      const res = await api.get(`/api/admin/users/${id}`, { token })
      setSelected(res.data)
    } catch (err) {
      setMessage(err.message)
    }
  }

  const suspend = async (id) => {
    if (!confirm('Suspend this member?')) return
    try {
      await api.post(`/api/admin/users/${id}/suspend`, {}, { token })
      setSelected((s) => s && { ...s, status: 'SUSPENDED' })
      setMembers((list) => list.map((m) => (m._id === id ? { ...m, status: 'SUSPENDED' } : m)))
    } catch (err) {
      setMessage(err.message)
    }
  }

  const removeMember = async (id) => {
    if (!confirm('Delete this member? This cannot be undone.')) return
    try {
      // Pass token as third argument (opts). First arg: path, second: data body (none here), third: opts.
      await api.delete(`/api/admin/users/${id}`)
      setMembers((list) => list.filter((m) => m._id !== id))
      if (selected?.id === id) setSelected(null)
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div className="page container">
      <div style={{ marginBottom: 12 }}>
        <BackButton />
      </div>
      <h2>Manage</h2>
      {message && <div className="meta" style={{ color: 'var(--accent-red)' }}>{message}</div>}

      <div className="admin-grid">
        <section>
          <h3>Pending</h3>
          <ul className="list">
            {pending.map((p) => (
              <li key={p._id} className="space-between">
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span>{p.title}</span>
                  {/* Allow admin to preview full content + tags before approving */}
                  <Link className="btn" to={`/posts/${p._id}`}>View</Link>
                </span>
                <span className="stamp">PENDING</span>
                <div className="actions" style={{ marginLeft: 'auto' }}>
                  <button className="btn" onClick={() => approve(p._id)}>Approve</button>
                  <button className="btn danger" onClick={() => deletePostAdmin(p._id)}>Delete</button>
                </div>
              </li>
            ))}
            {pending.length === 0 && <div>No pending items</div>}
          </ul>

          <div className="newspaper-rule" />

          <h3>Published</h3>
          <ul className="list">
            {published.map((p) => (
              <li key={p._id} className="space-between">
                <span>{p.title}</span>
                <div className="actions" style={{ marginLeft: 'auto' }}>
                  <button className="btn danger" onClick={() => deletePostAdmin(p._id)}>Delete</button>
                </div>
              </li>
            ))}
            {published.length === 0 && <div>No published posts</div>}
          </ul>

          {deleteMemo.id && (
            <div className="memo mt-3">
              <h4>Official Memo · Deletion Reason</h4>
              <textarea placeholder="Enter reason (shown to author)" value={deleteMemo.reason} onChange={(e) => setDeleteMemo({ id: deleteMemo.id, reason: e.target.value })} />
              <div className="actions mt-2">
                <button className="btn danger" onClick={confirmDelete}>Confirm Delete</button>
                <button className="btn" onClick={() => setDeleteMemo({ id: null, reason: '' })}>Cancel</button>
              </div>
            </div>
          )}
        </section>

        <section>
          <h3>Members</h3>
          <div className="search-bar">
            <input placeholder="Search name/email" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn" onClick={() => { loadMembers() }}>Search</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 12 }}>
            <ul className="member-rows">
              {members.map((m) => (
                <li key={m._id} className="member-row">
                  <button onClick={() => viewMember(m._id)} style={{ textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                    {m.profile?.name || m.email}
                  </button>
                  <span className="meta">{m.email}</span>
                  <span className="meta">{m.status}</span>
                </li>
              ))}
            </ul>
            <div>
              {selected ? (
                <div className="card">
                  <div className="space-between" style={{ alignItems: 'center' }}>
                    <h4 style={{ margin: 0 }}>{selected.profile?.name || selected.email}</h4>
                    {/* Close/X to go back to members list */}
                    <button className="btn" aria-label="Close" onClick={() => setSelected(null)}>
                      ×
                    </button>
                  </div>
                  <p><b>Email:</b> {selected.email}</p>
                  <p><b>Role:</b> {selected.role}</p>
                  <p><b>Status:</b> {selected.status}</p>
                  {selected.profile?.bio && <p><b>Bio:</b> {selected.profile.bio}</p>}
                  {selected.profile?.photoUrl && <p><b>Photo:</b> <a href={selected.profile.photoUrl} target="_blank" rel="noreferrer">view</a></p>}
                  <div className="actions mt-2">
                    <Link className="btn" to={`/posts?author=${selected.id}`}>View posts</Link>
                  </div>
                  {(() => {
                    const isAdminTarget = String(selected.role).toUpperCase() === 'ADMIN'
                    const isSelf = user && String(selected.id) === String(user.id)
                    if (isAdminTarget || isSelf) {
                      return (
                        <div className="muted mt-2">
                          Admin accounts and your own account cannot be suspended or deleted.
                        </div>
                      )
                    }
                    return (
                      <div className="actions">
                        <button className="btn" onClick={() => suspend(selected.id)}>Suspend</button>
                        <button className="btn danger" onClick={() => removeMember(selected.id)}>Delete</button>
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <div>Select a member to view details</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
