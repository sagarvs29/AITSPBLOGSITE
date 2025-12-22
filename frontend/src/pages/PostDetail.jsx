import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext'
import BackButton from '../components/BackButton'

export default function PostDetail() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [related, setRelated] = useState([])

  const load = async () => {
    const res = await api.get(`/api/posts/${id}`)
    setPost(res.data)
    const c = await api.get(`/api/comments?postId=${id}&page=1&limit=20`)
    setComments(c.data.items)
    // Load related by author or tag to keep the page purposeful
    try {
      const p = res.data
      let rel = { data: { items: [] } }
      if (p.authorId) {
        rel = await api.get(`/api/posts?status=published&author=${p.authorId}&limit=3`)
      } else if (Array.isArray(p.tags) && p.tags.length) {
        rel = await api.get(`/api/posts?status=published&tag=${encodeURIComponent(p.tags[0])}&limit=3`)
      }
      const items = (rel.data.items || []).filter((x) => x._id !== id)
      setRelated(items)
    } catch (_) {}
  }

  useEffect(() => { load() }, [id])

  const addComment = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/api/comments', { postId: id, content }, { token })
      setContent('')
      setComments((list) => [{ _id: res.data.id, authorId: user?._id, content }, ...list])
    } catch (err) {
      setMessage(err.message)
    }
  }

  const deleteOwn = async (cid) => {
    try {
      await api.del(`/api/comments/${cid}`, { token })
      setComments((list) => list.filter((c) => c._id !== cid))
    } catch (err) {
      setMessage(err.message)
    }
  }

  const hideAdmin = async (cid) => {
    try {
      await api.post(`/api/comments/${cid}/hide`, {}, { token })
      setComments((list) => list.filter((c) => c._id !== cid))
    } catch (err) {
      setMessage(err.message)
    }
  }

  if (!post) return <div className="tty">Teletype...</div>

  return (
    <div className="page container">
      <div style={{ marginBottom: 12 }}>
        <BackButton />
      </div>
      <div className="broadside">
        <aside className="index" />
        <main className="frontpage" style={{ gridColumn: '2 / span 2' }}>
          <div className="post-header">
            <h2>{post.title}</h2>
            {post.tags && post.tags.length > 0 && (
              <div className="tag-list">
                {post.tags.map((t) => (<span key={t} className="tag">#{t}</span>))}
              </div>
            )}
          </div>
          <div className="post-content">
            {post.content}
          </div>

          <h3 className="mt-4">Comments</h3>
          {token && (
            <form onSubmit={addComment} className="comment-form">
              <textarea placeholder="Add a comment" value={content} onChange={(e) => setContent(e.target.value)} />
              <button className="btn" type="submit">Comment</button>
            </form>
          )}
          {message && <div className="muted" style={{ color: 'var(--accent-red)' }}>{message}</div>}
          <ul className="comment-list">
            {comments.map((c) => (
              <li key={c._id} className="comment-item">
                <span style={{ flex: 1 }}>{c.content}</span>
                {token && user?._id === c.authorId && (
                  <button className="btn" onClick={() => deleteOwn(c._id)}>Delete</button>
                )}
                {token && user?.role === 'admin' && (
                  <button className="btn" onClick={() => hideAdmin(c._id)}>Hide</button>
                )}
              </li>
            ))}
          </ul>

          {/* Related to keep engagement and avoid empty bottoms */}
          {related.length > 0 && (
            <div className="mt-4">
              <h3>Related posts</h3>
              <div className="grid-3 mt-2">
                {related.map((p) => (
                  <article key={p._id} className="story card-hover">
                    <h4 className="story-title"><a href={`/posts/${p._id}`}>{p.title}</a></h4>
                    {p.tags && p.tags.length > 0 && (
                      <div className="story-meta">#{p.tags.join(', #')}</div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </main>
        <aside className="ledger">
          <div className="meta">Author: {post.authorEmail || '—'}</div>
        </aside>
      </div>
    </div>
  )
}
