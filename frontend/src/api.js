import axios from "axios";

const RAILWAY_FALLBACK = "https://aitspblogsite-production.up.railway.app";

export const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production" ? RAILWAY_FALLBACK : "http://localhost:5000");

// Base HTTP client
const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Optional: attach token from localStorage automatically
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

function authHeaders(opts) {
  const token = opts?.token || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toResponse(promise) {
  return promise
    .then((resp) => ({ data: resp.data }))
    .catch((err) => {
      const message =
        err?.response?.data?.error || err?.response?.data?.message || "API request failed";
      throw new Error(message);
    });
}

// Wrapper methods with consistent signatures used across the app
export const api = {
  get(path, opts) {
    return toResponse(client.get(path, { headers: authHeaders(opts) }));
  },
  post(path, data, opts) {
    return toResponse(client.post(path, data, { headers: authHeaders(opts) }));
  },
  put(path, data, opts) {
    return toResponse(client.put(path, data, { headers: authHeaders(opts) }));
  },
  patch(path, data, opts) {
    return toResponse(client.patch(path, data, { headers: authHeaders(opts) }));
  },
  // Axios delete expects data via config: { data }
  delete(path, opts) {
    const { data, ...rest } = opts || {};
    return toResponse(client.delete(path, { data, headers: authHeaders(rest) }));
  },
  // Alias used in Admin.jsx (avoid reserved keyword in call sites)
  del(path, data, opts) {
    return toResponse(client.delete(path, { data, headers: authHeaders(opts) }));
  },
};
