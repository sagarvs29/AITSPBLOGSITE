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

- Account: register → login (no emails/OTP); password login; me; update profile
- Visibility: PUBLIC / PRIVATE / CONNECTIONS; directory only shows PUBLIC
- Connections: add/remove/list; impacts public profile visibility
- Posts: draft → submit (PENDING) → approve (PUBLISHED); tags; search; author filter
- Comments: add/delete own; admin hide
- Admin: stats, user search, suspend/delete, moderate posts, view author posts

## How to use (app flow)

End-to-end usage from a fresh setup or the deployed site:

1) Register and log in
- Use the Register page to create a user account, then log in.
- Your JWT is stored in localStorage and used for authenticated requests.

2) Update your profile
- Go to Profile and set name, photo, bio, and choose visibility: PUBLIC, PRIVATE, or CONNECTIONS.

3) Explore the directory
- Directory shows only PUBLIC profiles. Use search and pagination to browse.
- Connect to other members; CONNECTIONS visibility becomes visible to connected users.

4) Write and publish a post
- Create a post (draft), then Submit for review (status: PENDING).
- An Admin reviews and Approves it (status: PUBLISHED). Published posts appear in listings and can be viewed by anyone.

5) Comment and moderate
- Logged-in users can comment on posts and delete their own comments.
- Admins can hide comments that violate guidelines.

6) Admin moderation
- Admin can search members, Suspend or Delete accounts, review pending posts, and Approve or Delete posts (with an official memo/reason).

## Admin login (defaults)

Out of the box (or after running the seed script), the default admin credentials are:

- Email: admin@example.com
- Password: secret123

To set or change the admin credentials, use env vars and the seed script in `backend/`:

```powershell
# From repo root
Set-Location -Path 'e:\AISP\TASK\backend'

# Optional overrides
$env:ADMIN_EMAIL = 'admin@example.com'
$env:ADMIN_PASSWORD = 'secret123'
$env:ADMIN_NAME = 'Admin'
$env:ADMIN_FORCE_RESET_PASSWORD = 'true' # resets existing admin's password

node .\scripts\seed-admin.js
```

Log in with the admin account to access the Admin page for moderation.

## Live (Railway)

If you’re using the provided Railway deployments:

- Frontend: https://mindful-clarity-production.up.railway.app
- Backend API: https://aitspblogsite-production.up.railway.app

Notes:
- The frontend must point to the backend via `VITE_API_URL` at build/deploy time.
- Backend CORS must allow the frontend origin.

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

## Frontend – Railway Deployment (Static Hosting)

The frontend is Vite/React and deploys as static assets. Railway requirements are already wired:

- Build: `npm run build`
- Start: `npm run start` (serves `dist` using Vite preview and binds to Railway's `PORT`)
- Environment: set `VITE_API_URL` in Railway service settings (no `.env` in production)

Steps (high level):

1. In Railway, create a new service from the `frontend/` directory.
2. Set Environment Variables:
  - `VITE_API_URL` → your deployed backend URL (e.g., `https://<backend>.up.railway.app`)
3. Build Command: `npm run build`
4. Start Command: `npm run start`
5. Deploy. The app will bind to `PORT` automatically.

Notes:
- The app reads `import.meta.env.VITE_API_URL` at runtime/build; no server-side rendering.
- Fonts are loaded via Google Fonts CDN in `frontend/index.html` and work in static hosting.
- Animations are CSS-only and respect `prefers-reduced-motion`.

## Backend – Railway Deployment

Backend is a Node/Express API. Provide the required env vars and expose the port Railway assigns:

- Required: `MONGO_URL`, `JWT_SECRET`
- Optional: `CORS_ORIGIN` (set to your frontend Railway URL)
- Start command: `npm start`

Ensure MongoDB is reachable from Railway (e.g., MongoDB Atlas connection string) and CORS allows your frontend origin.

## Auth flow (Railway‑ready)

- Register (`POST /api/auth/register`) creates a verified account and returns a JWT.
- Login (`POST /api/auth/login`) issues a JWT for email/password.
- Me (`GET /api/auth/me`) returns `{ id, email, role, status, profile }`.

## Key API (selection)

- Users
  - `GET /api/users/me` (auth)
  - `PUT /api/users/me` (auth) → `{ name, photoUrl, bio, visibility }`
  - `GET /api/users/directory?q=&page=&limit=`
 ## Auth flow (Railway‑ready)
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

- Backend: run Node process (PM2/systemd) or Railway Node service; set env securely; enable HTTPS via platform.
- Frontend: static `dist/` hosted by Railway service with `npm start` preview server; set `VITE_API_URL` to your API.
- CORS: restrict to your production frontend origin.

## Visual design & accessibility

- Editorial theme: neutral palette with muted oxblood accent; strong contrast for readability.
- Typography: Playfair Display (headings), PT Serif (body), Courier Prime (meta). Long-form content constrained to ~75ch.
- Motion: subtle page/card entrances and hover states; no layout shifts; `prefers-reduced-motion` honored.
- Dark mode: optional soft dark theme via Theme Toggle (in the nav); persisted in localStorage; also respects system preference.

## References

- More details in `backend/README.md` and `frontend/README.md`.
- Integration scenarios and migration checklist in `docs/INTEGRATION.md`.
