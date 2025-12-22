import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext'

export default function Home() {
  const [items, setItems] = useState([])
  const { token } = useAuth()

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get('/api/posts?status=published&page=1&limit=8')
        setItems(res.data.items || [])
      } catch (err) {
        console.warn('Failed to load home posts', err)
      }
    })()
  }, [])

  const featured = items[0]
  const rest = items.slice(1)

  return (
    <div className="page container">
      <div className="broadside">
        <aside className="index">
          <div className="card">
            <h4>Welcome</h4>
            <p className="muted">Read thoughtful posts from our community or start writing yours today.</p>
            <div className="actions">
              <Link className="btn" to="/posts">Read posts</Link>
              {token && <Link className="btn secondary" to="/create-post">Write a post</Link>}
              {!token && <Link className="btn secondary" to="/login">Sign in to write</Link>}
            </div>
          </div>
        </aside>
        <main className="frontpage" style={{ gridColumn: '2 / span 2' }}>
          <h2>Latest</h2>
          {/* Featured article */}
          {featured && (
            <article className="hero">
              <h3 className="hero-title"><Link to={`/posts/${featured._id}`}>{featured.title}</Link></h3>
              <div className="hero-meta">By {featured.authorEmail || 'Unknown'} • {new Date(featured.publishedAt || featured.createdAt).toLocaleDateString()}</div>
              {featured.content && (
                <p className="hero-excerpt">{String(featured.content).slice(0, 220)}…</p>
              )}
              <div className="read-link"><Link to={`/posts/${featured._id}`}>Read full story →</Link></div>
            </article>
          )}

          {/* Grid of recent articles */}
          <div className="grid-3 mt-4">
            {rest.map((p) => (
              <article key={p._id} className="story card-hover">
                <h3 className="story-title"><Link to={`/posts/${p._id}`}>{p.title}</Link></h3>
                {p.tags && p.tags.length > 0 && (
                  <div className="story-meta">#{p.tags.join(', #')}</div>
                )}
                <p className="muted">{String(p.content || '').slice(0, 120)}…</p>
                <div className="read-link"><Link to={`/posts/${p._id}`}>Read more →</Link></div>
              </article>
            ))}
          </div>

          {/* Secondary CTA row to keep the page purposeful */}
          <div className="actions mt-4">
            <Link className="btn" to="/posts">Browse all posts</Link>
            {token && <Link className="btn secondary" to="/create-post">Start writing</Link>}
          </div>
        </main>
        <aside className="ledger">
          <div className="card">
            <h4>Trending Tags</h4>
            <div className="meta">#writing #javascript #react #life</div>
          </div>
        </aside>
      </div>
    </div>
  )
}
