# Milestone 5 – Frontend

A minimal React (Vite) app to exercise the backend APIs from Milestones 1–4.

## Setup

1. Copy `.env.example` to `.env` and set `VITE_API_URL` to your backend (default http://localhost:5000).
2. Ensure backend CORS allows your frontend origin (for Vite default `http://localhost:5173`).
3. Install and run:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Features

- Auth: Register/Login, token saved to localStorage, fetch `/api/auth/me` on load
- Profile: View and update `/api/users/me`
- Directory: Search/paginate `/api/users/directory`
- Posts: List published, view details
- Comments: Add/Delete own, Admin can Hide
- Writer: Create draft and submit for approval
- Admin: List pending posts and approve publish

## Notes

- If you see CORS errors, set `CORS_ORIGIN` in backend `.env` to your frontend URL.
- Admin actions require logging in as an admin user. Use your existing admin or seed one via backend script.
