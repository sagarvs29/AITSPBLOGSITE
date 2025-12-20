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
    <div>
      <h2>Write a post</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 640 }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
        <input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
        <button type="submit">Submit for approval</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  )
}
