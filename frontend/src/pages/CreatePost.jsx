import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { api } from '../api'

export default function CreatePost() {
  const { token } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [message, setMessage] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/api/posts', { title, content, tags: tags.split(',').map(t => t.trim()).filter(Boolean) }, { token })
      const id = res.data.id
      await api.post(`/api/posts/${id}/submit`, {}, { token })
      setMessage('Submitted for approval')
      setTitle(''); setContent(''); setTags('')
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div className="page container">
      <div className="broadside">
        <aside className="index">
          <div className="card">
            <h4>Writing tips</h4>
            <ul className="list">
              <li>Use a clear, descriptive title.</li>
              <li>Keep paragraphs short for readability.</li>
              <li>Add 2-5 tags to help discovery.</li>
            </ul>
          </div>
        </aside>
        <main className="frontpage" style={{ gridColumn: '2 / span 2' }}>
          <h2>Write a post</h2>
          <form onSubmit={onSubmit} className="auth-form" style={{ maxWidth: 800 }}>
            <label>Title</label>
            <input placeholder="Your headline" value={title} onChange={(e) => setTitle(e.target.value)} />
            <label>Content</label>
            <textarea placeholder="Start writing..." value={content} onChange={(e) => setContent(e.target.value)} rows={14} />
            <label>Tags</label>
            <input placeholder="e.g. javascript, react" value={tags} onChange={(e) => setTags(e.target.value)} />
            <div className="actions">
              <button className="btn" type="submit">Submit for approval</button>
              <span className="muted">Your post will be reviewed before publishing.</span>
            </div>
          </form>
          {message && <div className="mt-3 memo">{message}</div>}
        </main>
        <aside className="ledger">
          <div className="card">
            <h4>Publishing</h4>
            <p className="muted">We aim for quality. Submissions are typically reviewed within 24 hours.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
