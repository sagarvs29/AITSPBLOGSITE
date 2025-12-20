import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'

export default function Posts() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(4)
  const [total, setTotal] = useState(0)
  const [searchParams] = useSearchParams()
  const author = searchParams.get('author') || ''

  const load = async () => {
    const queryAuthor = author ? `&author=${encodeURIComponent(author)}` : ''
    const res = await api.get(`/api/posts?status=published&page=${page}&limit=${limit}${queryAuthor}`)
    setItems((prev) => {
      if (page === 1) return res.data.items
      const existing = new Set(prev.map((i) => i._id))
      const merged = [...prev, ...res.data.items.filter((i) => !existing.has(i._id))]
      return merged
    })
    setTotal(res.data.total)
  }

  useEffect(() => { load() }, [page, limit, author])

  return (
    <div className="page container">
      <div className="broadside">
        <main className="frontpage" style={{ gridColumn: '1 / -1' }}>
          <h2>Posts</h2>
          {author && (
            <div className="meta mb-3">Filtered by author · <Link to="/posts">Clear filter</Link></div>
          )}

          {/* First four in four corners (2x2 grid) */}
          {items.length > 0 && (
            <div className="grid-2x2 mt-4">
              {items.slice(0, 4).map((p) => (
                <article key={p._id} className="story">
                  <h3 className="story-title"><Link to={`/posts/${p._id}`}>{p.title}</Link></h3>
                  {p.tags && p.tags.length > 0 && (
                    <div className="story-meta">#{p.tags.join(', #')}</div>
                  )}
                  <div className="read-link"><Link to={`/posts/${p._id}`}>Read more →</Link></div>
                </article>
              ))}
            </div>
          )}

          {/* Remaining posts follow below in flow */}
          {items.length > 4 && (
            <div className="grid-3 mt-4">
              {items.slice(4).map((p) => (
                <article key={p._id} className="story">
                  <h3 className="story-title"><Link to={`/posts/${p._id}`}>{p.title}</Link></h3>
                  {p.tags && p.tags.length > 0 && (
                    <div className="story-meta">#{p.tags.join(', #')}</div>
                  )}
                  <div className="read-link"><Link to={`/posts/${p._id}`}>Read more →</Link></div>
                </article>
              ))}
            </div>
          )}

          {/* See more button inside the posts section */}
          {page * limit < total && (
            <div style={{ marginTop: 16 }}>
              <button className="btn" onClick={() => setPage((p) => p + 1)}>See more</button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
