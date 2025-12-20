# AITSP BLOGS – Full‑Stack App (Backend + Frontend)

A content‑focused community app with a readable newspaper aesthetic. It provides user auth, profiles, connections, posts with moderation, comments, and an admin console.

This README is the technical overview for developers. For integration/migration guidance, see `docs/INTEGRATION.md`.

## Tech stack

- Backend: Node.js, Express, MongoDB (Mongoose), Zod validation, JWT auth
- Frontend: React (Vite), React Router, Context‑based auth
- Tooling: Nodemon (dev), Vite (dev/build), Jest-like minimal tests (integration/unit placeholders)

## Monorepo layout

```
backend/
  src/
    app.js           # Express app wiring
    server.js        # HTTP bootstrap
    config/          # env, mongo, logger
    controllers/     # route handlers
    middleware/      # auth/rate limit/validation/error
    models/          # Mongoose schemas
    routes/          # HTTP routers
    services/        # auth/mail helpers
    validators/      # Zod schemas
    utils/           # small helpers
  scripts/seed-admin.js
  package.json

frontend/
  src/
    App.jsx, main.jsx
    auth/            # context + protected route
    components/      # UI (Nav, Back button)
    pages/           # Posts, PostDetail, Admin, Directory, Auth, etc.
    styles/app.css   # Global readable Gazette aesthetic
  package.json
```

## Core features

- Account: register → email OTP → verify → login; password login; me; update profile
- Visibility: PUBLIC / PRIVATE / CONNECTIONS; directory only shows PUBLIC
- Connections: add/remove/list; impacts public profile visibility
- Posts: draft → submit (PENDING) → approve (PUBLISHED); tags; search; author filter
- Comments: add/delete own; admin hide
- Admin: stats, user search, suspend/delete, moderate posts, view author posts

## Backend setup (Windows PowerShell)

1) Configure environment:

```powershell
# From repo root
Set-Location -Path 'e:\AISP\TASK\backend'

# Required
$env:MONGO_URL = 'mongodb://localhost:27017/aitsp'
$env:JWT_SECRET = 'replace_with_strong_secret'

# Optional
$env:PORT = '5000'                 # default
$env:CORS_ORIGIN = 'http://localhost:5173'  # Vite dev origin
```

2) Install and run:

```powershell
npm install
npm run dev   # or: npm start
```

3) Seed or update an admin (optional but recommended):

```powershell
# Default admin: admin@example.com / secret123
npm run seed:admin

# Overrides
$env:ADMIN_EMAIL = 'admin@example.com'
$env:ADMIN_PASSWORD = 'secret123'
$env:ADMIN_NAME = 'Admin'
$env:ADMIN_FORCE_RESET_PASSWORD = 'true'  # only if you want to reset an existing account's password
node .\scripts\seed-admin.js
```

## Frontend setup (Windows PowerShell)

1) Configure environment:

```powershell
Set-Location -Path 'e:\AISP\TASK\frontend'
$env:VITE_API_URL = 'http://localhost:5000'
```

2) Install and run:

```powershell
npm install
npm run dev
# Open http://localhost:5173
```

3) Production build:

```powershell
npm run build
# Output in frontend/dist
```

## Auth & OTP flow

- Register (`POST /api/auth/register`) creates a user and sends a six‑digit OTP (in dev, email logs to console).
- Verify (`POST /api/auth/verify-otp`) exchanges the OTP for a JWT and marks the user verified.
- Login (`POST /api/auth/login`) issues a JWT for email/password.
- Me (`GET /api/auth/me`) returns `{ id, email, role, status, profile }`.

Frontend Verify step uses segmented OTP boxes with auto‑advance, backspace navigation, paste distribution, and submission when complete.

## Key API (selection)

- Users
  - `GET /api/users/me` (auth)
  - `PUT /api/users/me` (auth) → `{ name, photoUrl, bio, visibility }`
  - `GET /api/users/directory?q=&page=&limit=`
  - `POST /api/users/:id/connect` (auth)
  - `DELETE /api/users/:id/connect` (auth)
  - `GET /api/users/:id` (auth optional; visibility rules apply)

- Posts
  - `POST /api/posts` (auth) → draft
  - `POST /api/posts/:id/submit` (auth, author) → PENDING
  - `POST /api/posts/:id/approve` (auth, admin) → PUBLISHED
  - `GET /api/posts?q=&author=&status=&tag=&page=&limit=`
  - `GET /api/posts/:id`
  - `PUT /api/posts/:id` (auth, author)
  - `DELETE /api/posts/:id` (auth, author) → soft‑delete

- Comments
  - `GET /api/comments?postId=&page=&limit=`
  - `POST /api/comments` (auth)
  - `DELETE /api/comments/:id` (auth, owner)
  - `POST /api/comments/:id/hide` (auth, admin)

- Admin (auth + admin)
  - `GET /api/admin/stats`
  - `GET /api/admin/users?q=&status=&page=&limit=`
  - `GET /api/admin/users/:id`
  - `GET /api/admin/posts?q=&author=&status=&tag=&page=&limit=`
  - `POST /api/admin/users/:id/suspend`
  - `DELETE /api/admin/users/:id`

## Common issues & fixes

- Unauthorized on admin actions
  - Ensure you’re logged in as an ADMIN.
  - Frontend API calls must include `Authorization: Bearer <token>`.
  - In `Admin.jsx`, deletion uses `api.del(path, undefined, { token })` (token is the third argument).

- CORS errors
  - Set `CORS_ORIGIN` to your frontend origin; restart backend.

- Mongo connection fails
  - Verify `MONGO_URL`, ensure MongoDB is running, and the database name is reachable.

## Testing & health

- Basic tests are included for auth in `backend/tests/integration/auth.test.js`.
- Health endpoints: `GET /health`, `GET /ready`.

## Deployment notes

- Backend: run Node process (PM2/systemd) behind a reverse proxy; set env securely; enable HTTPS.
- Frontend: host static `dist/` via any web server (NGINX, Azure Static Web Apps, etc.); set `VITE_API_URL` to your API.
- CORS: restrict to your production frontend origin.

## References

- More details in `backend/README.md` and `frontend/README.md`.
- Integration scenarios and migration checklist in `docs/INTEGRATION.md`.
