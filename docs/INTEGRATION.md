# Integration Guide – Using AITSP BLOGS with an existing setup

This guide explains how to integrate the backend and/or frontend into an existing environment, and how the app behaves so you can adopt it with minimal friction.

## What you can integrate

- Backend only: reuse APIs and data models with your existing frontend
- Frontend only: plug the React UI into your existing backend if APIs are compatible
- Full stack: run both together as‑is (recommended to start)

## Compatibility overview

- Auth: JWT Bearer tokens; `Authorization: Bearer <token>`
- Users: visibility flags (PUBLIC/PRIVATE/CONNECTIONS) drive directory and public profile access
- Posts: status lifecycle (DRAFT → PENDING → PUBLISHED → DELETED)
- Comments: owner delete; admin hide

## Backend integration

1) Environment contract

- Required env
  - `MONGO_URL` – your MongoDB URI
  - `JWT_SECRET` – strong secret shared by all app instances
- Optional env
  - `PORT` (default 5000)
  - `CORS_ORIGIN` – set to your frontend origin(s)

2) Data models (Mongoose)

- `User`
  - Fields include: `username`, `passwordHash`, `role` (USER/ADMIN), `status` (ACTIVE/SUSPENDED), `isVerified` (defaults true), `profile { name, photoUrl, bio, visibility }`, `connections[]`
- `Post`
  - `{ authorId, title, slug(unique), content, status, publishedAt, tags[] }`
- `Comment`
  - `{ postId, authorId, content, hidden }`

If your existing schemas differ, map field names during migration or expose adapter endpoints.

3) Auth & middleware

- `requireAuth` – validates JWT, loads `req.user`
- `requireAdmin` – ensures `req.user.role === 'ADMIN'`
- `requireActive` – ensures `req.user.status === 'ACTIVE'`

If you have your own auth, you can wrap/replace `requireAuth` to accept your tokens and populate `req.user` accordingly.

4) Routing

- API is namespaced under `/api`.
- Admin endpoints under `/api/admin/*` require admin role.
- If you mount behind an existing server, proxy `/api` to this app.

5) Admin account

Seed an admin or upgrade an existing account:

```powershell
cd backend
npm run seed:admin
# Overrides via env: ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_FORCE_RESET_PASSWORD
```

6) Data migration tips

- Users: set `isVerified=true` for existing accounts
- Posts: normalize `status` to uppercase values (`DRAFT`, `PENDING`, `PUBLISHED`, `DELETED`)
- Directory: set `profile.visibility='PUBLIC'` for users you want to appear

7) CORS & proxies

- Set `CORS_ORIGIN` to your frontend URLs
- When behind a reverse proxy, forward `Authorization` header and support HTTPS

## Frontend integration

1) Environment

- `VITE_API_URL` points to your API root (e.g., `https://api.example.com`)
- Tokens stored in `localStorage` (`token` key)

2) Auth context & routes

- `AuthContext.jsx` handles login/register/me and stores JWT
- `ProtectedRoute.jsx` guards routes that need auth

If your backend differs, adjust `frontend/src/api.js` and the auth methods accordingly.

3) UI adoption

- Styles in `src/styles/app.css` implement a readable Gazette aesthetic
- Nav brand uses “AITSP BLOGS”; change via `components/NavBar.jsx`

4) Feature wiring

- Admin page depends on admin token; ensure your login flow issues admin JWTs
- Posts page supports `?author=<id>` to filter by author
- First four posts display as a 2×2 grid with a “See more” pagination

## Deployment patterns

- Backend: Node process with PM2 or Railway dyno runner, env provided via Railway variables; MongoDB via Railway add‑on or external Atlas URI
- Frontend: build `dist/` and host with Railway static deployment or separate static host; set `VITE_API_URL` at build time

## QuickStart: Deploy on Railway (Monorepo)

Two services recommended: one for `backend/` (Node API) and one for `frontend/` (static React build).

1) Backend service (Node/Express)

- Root: `backend/`
- Env vars:
  - `MONGO_URL` → your MongoDB Atlas URI
  - `JWT_SECRET` → strong secret
  - `CORS_ORIGIN` → your frontend Railway URL (e.g., `https://<frontend>.up.railway.app`)
- Commands:
  - Build: (none)
  - Start: `npm start`

2) Frontend service (Static)

- Root: `frontend/`
- Env vars:
  - `VITE_API_URL` → your backend Railway URL (e.g., `https://<backend>.up.railway.app`)
- Commands:
  - Build: `npm run build`
  - Start: `npm run start` (uses Vite preview and binds to `PORT`)

Notes
- No `.env` files are required in production—use Railway’s Environment settings.
- Health checks: the backend exposes `/health` and `/ready`.
- Node engines: both packages declare `"engines": { "node": ">=18" }` to match Railway defaults.

## Security & operations

- Always use HTTPS in production; secure `JWT_SECRET`
- Limit CORS to trusted origins; set appropriate rate limits
- Consider audit logging for admin actions (suspend/delete/approve)

## Troubleshooting

- Unauthorized (401) when calling admin endpoints
  - Ensure requests include `Authorization: Bearer <token>` and that the user has role `ADMIN`
  - Frontend delete calls should pass token as the third argument to `api.del(path, data, opts)`
- CORS blocked
  - Check `CORS_ORIGIN` and that your proxy forwards headers correctly
- Cannot connect to Mongo
  - Provide a valid `MONGO_URL` and reachable database

## Migration checklist

- [ ] Configure `MONGO_URL`, `JWT_SECRET`, `CORS_ORIGIN`
- [ ] Seed or promote an admin account
- [ ] Verify token issuance and `GET /api/auth/me` works
- [ ] Map/normalize user and post fields to expected schema
- [ ] Point frontend `VITE_API_URL` to your API
- [ ] Test login/register, directory, posts, comments, and admin flows

## Where to go next

- Technical details: root `README.md`, `backend/README.md`, `frontend/README.md`
- If you need adapters for your existing auth or data, start in `backend/src/middleware/auth.js` and `backend/src/controllers/*`.
