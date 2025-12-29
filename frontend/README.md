# Frontend (Vite + React)

A content‑first blog frontend with a readable newspaper aesthetic, optional soft dark mode, and subtle motion.

## Local setup

1. Set API endpoint (either env or .env for local only):

```powershell
setx VITE_API_URL "http://localhost:5000"
```

Alternatively, create `.env` with:

```
VITE_API_URL=http://localhost:5000
```

2. Ensure backend CORS allows your frontend origin (Vite default `http://localhost:5173`).
3. Install and run:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Production build

```powershell
npm run build
# Output in dist/
```

## Railway deployment (static hosting)

This app is static and Railway-ready:

- Build command: `npm run build`
- Start command: `npm run start` (Vite preview, binds to `PORT`)
- Environment: set `VITE_API_URL` in Railway; do not rely on `.env` in production

Steps:

1. Create a Railway service for `frontend/`.
2. Set env var `VITE_API_URL` → backend URL (e.g., `https://<backend>.up.railway.app`).
3. Configure Build `npm run build` and Start `npm run start`.
4. Deploy.

## Features

- Auth: Register/Login, token saved to localStorage, fetch `/api/auth/me` on load
- Profile: View and update `/api/users/me`
- Directory: Search/paginate `/api/users/directory`
- Posts: List published, view details
- Comments: Add/Delete own, Admin can Hide
- Writer: Create draft and submit for approval
- Admin: List pending posts and approve publish

### Visual polish

- Subtle CSS-only animations (page and cards) with `prefers-reduced-motion` support
- Soft dark mode via Theme Toggle (stored in `localStorage`, respects system preference)
- Optimized reading width (~75ch) and high-contrast editorial palette

## Notes

- If you see CORS errors, set `CORS_ORIGIN` in backend `.env` to your frontend URL.
- Admin actions require logging in as an admin user. Use your existing admin or seed one via backend script.

## Environment variables

- `VITE_API_URL` (required) – URL of the backend API.

In production on Railway, set env vars in the service settings (do not ship `.env`).

## Usage flow (quick guide)

- Register and log in to get a JWT stored in localStorage.
- Update your profile (name, photo, bio) and choose visibility: PUBLIC, PRIVATE, or CONNECTIONS.
- Browse the Directory (PUBLIC profiles only), connect with members; CONNECTIONS visibility becomes visible to connected users.
- Create a post (draft), then Submit for review. An Admin approves it to publish.
- Comment on posts; you can delete your own comments. Admins can hide comments.

## Admin login (defaults)

If you seeded the backend admin using the provided script, the default credentials are:

- Username: `admin@example.com`
- Password: `secret123`

To change or set the admin password, run the seed script in `backend/` with overrides:

```powershell
cd backend
# Optional overrides before running the script
$env:ADMIN_USERNAME = 'admin@example.com'
$env:ADMIN_PASSWORD = 'secret123'
$env:ADMIN_NAME = 'Admin'
$env:ADMIN_FORCE_RESET_PASSWORD = 'true'  # reset existing admin password
node .\scripts\seed-admin.js
```

Once logged in as Admin, open the Admin page to moderate posts and manage members.
