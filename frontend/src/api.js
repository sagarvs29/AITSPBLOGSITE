import axios from "axios";

const RAILWAY_FALLBACK = "https://aitspblogsite-production.up.railway.app"

export const BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? RAILWAY_FALLBACK : "http://localhost:5000");

export const api = axios.create({
  baseURL: "https://aitspblogsite-production.up.railway.app",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Simplify responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || "API request failed";
    return Promise.reject(new Error(message));
  }
);
