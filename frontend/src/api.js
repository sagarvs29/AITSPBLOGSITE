const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function request(path, { method = 'GET', token, data } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) {
    const message = json?.error?.message || json?.message || res.statusText
    throw new Error(message)
  }
  return json
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, data, opts) => request(path, { ...opts, method: 'POST', data }),
  put: (path, data, opts) => request(path, { ...opts, method: 'PUT', data }),
  del: (path, data, opts) => request(path, { ...opts, method: 'DELETE', data }),
}

export { BASE_URL }
