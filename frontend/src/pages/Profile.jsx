import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { api } from '../api'

export default function Profile() {
  const { token, user } = useAuth()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [visibility, setVisibility] = useState('PUBLIC')
  const [message, setMessage] = useState('')
  const [myPosts, setMyPosts] = useState([])

  useEffect(() => {
    if (user) {
      setName(user.profile?.name || '')
      setBio(user.profile?.bio || '')
      setVisibility((user.profile?.visibility) || 'PUBLIC')
      ;(async () => {
        try {
          const res = await api.get(`/api/posts?status=published&author=${user._id}&page=1&limit=12`)
          setMyPosts(res.data.items || [])
        } catch (err) {
          /* ignore */
        }
      })()
    }
  }, [user])

  const onSave = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put('/api/users/me', { name, bio, visibility }, { token })
      setMessage('Saved')
    } catch (err) {
      setMessage(err.message)
    }
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="page container">
      <h2>Profile</h2>
      <p><b>Email:</b> {user.email}</p>
      <form onSubmit={onSave} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <div style={{ display: 'grid', gap: 4 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="radio" name="vis" checked={visibility === 'PUBLIC'} onChange={() => setVisibility('PUBLIC')} />
            Public
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="radio" name="vis" checked={visibility === 'PRIVATE'} onChange={() => setVisibility('PRIVATE')} />
            Private
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="radio" name="vis" checked={visibility === 'CONNECTIONS'} onChange={() => setVisibility('CONNECTIONS')} />
            Connections only
          </label>
        </div>
        <button type="submit">Save</button>
      </form>
      {message && <div>{message}</div>}

      {/* My posts */}
      <div className="mt-4">
        <h3>My posts</h3>
        {myPosts.length === 0 ? (
          <p className="muted">No published posts yet. <a href="/create-post">Start writing →</a></p>
        ) : (
          <div className="grid-3 mt-2">
            {myPosts.map((p) => (
              <article key={p._id} className="story card-hover">
                <h4 className="story-title"><a href={`/posts/${p._id}`}>{p.title}</a></h4>
                {p.tags && p.tags.length > 0 && (
                  <div className="story-meta">#{p.tags.join(', #')}</div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
