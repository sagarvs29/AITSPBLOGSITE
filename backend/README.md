# Community Backend (JS)

JavaScript-only Express + MongoDB backend scaffold for auth, profiles, blog posts, comments, and admin basics.

## Quick start

1. Copy `.env.example` to `.env` and set values.
2. Install dependencies.
3. Run the dev server.

### Scripts
- `npm run dev` – start with nodemon
- `npm start` – start server
- `npm run test:auth` – run integration smoke test (server must be running)

### Env
- `MONGO_URL` – MongoDB connection string
- `PORT` – server port (default 5000)
- `JWT_SECRET` – JWT signing secret
- `CORS_ORIGIN` – allowed frontend origin (defaults to `*`)

## Structure
```
src/
  app.js             # Express app
  server.js          # HTTP bootstrap
  config/            # env, mongo, logger
  routes/            # routers
  controllers/       # handlers
  models/            # Mongoose models
  middleware/        # auth, error
  services/          # auth/mail
  validators/        # request validation (Zod)
  utils/             # helpers
```

## Milestones

### Milestone 0 (Hardening)
- Security headers via Helmet, CORS configured from env, morgan logging
- Rate limiting on `/api`
- Health endpoints: `GET /health`, `GET /ready`
- Centralized error handling (Zod, duplicate keys, generic)

### Milestone 1 (Auth)
- Endpoints:
  - `POST /api/auth/register` { username, password, name? } → returns `{ data: { token } }`
  - `POST /api/auth/login` { username, password } → returns `{ data: { token } }`
  - `GET /api/auth/me` (Bearer token)
- Middleware: `requireAuth`, `requireActive`
- Validation: Zod schemas per route

### Milestone 2 (Profiles & Directory)
- `GET /api/users/me` → current user profile
- `PUT /api/users/me` → update profile (name, photoUrl, bio, visibility)
- `GET /api/users/directory?q=&page=&limit=` → public profiles with search + pagination (shows only `visibility=PUBLIC`)
- Text index on `profile.name` and `profile.bio`

Visibility options:
- `PUBLIC` – visible to everyone (appears in directory)
- `PRIVATE` – visible only to the user and admins (hidden from directory)
- `CONNECTIONS` – visible to users you connect to (hidden from public directory)

Connections:
- `POST /api/users/:id/connect` → add a connection (auth)
- `DELETE /api/users/:id/connect` → remove a connection (auth)
- `GET /api/users/connections` → list my connections (auth)
- `GET /api/users/:id` → view a user's profile with visibility rules (PUBLIC, PRIVATE, CONNECTIONS)

### Milestone 3 (Community Blogs)
- Post model: `{ authorId, title, slug(unique), content, status, publishedAt, tags[] }`
- Endpoints:
  - `POST /api/posts` (auth, active) → create draft
  - `POST /api/posts/:id/submit` (author) → mark as PENDING
  - `POST /api/posts/:id/approve` (admin) → publish (status = PUBLISHED)
  - `GET /api/posts?q=&author=&status=&page=&limit=&tag=` → list with search & pagination
  - `GET /api/posts/:id` → get by id
  - `PUT /api/posts/:id` (author) → update title/content/tags; slug updates if title changes
  - `DELETE /api/posts/:id` (author) → soft-delete
- Comments:
  - `GET /api/comments?postId=&page=&limit=` → list comments for a post
  - `POST /api/comments` (auth, active) → add comment
  - `DELETE /api/comments/:id` (owner) → delete own comment
  - `POST /api/comments/:id/hide` (admin) → hide comment

## Postman – Comments quick test

Set up a Postman environment (e.g., "Local Backend") with these variables:
- `baseUrl` = `http://localhost:5000`
- `token` = login token for a normal user
- `adminToken` = login token for an admin user
- `postId` = the ID of the post you’ll comment on
- `commentId` = will be set by a test after creating a comment

Requests:
1) List comments
  - Method: GET
  - URL: `{{baseUrl}}/api/comments?postId={{postId}}&page=1&limit=10`
  - Expect: `{ success: true, data: { items, page, limit, total, pages } }`

2) Add comment
  - Method: POST
  - URL: `{{baseUrl}}/api/comments`
  - Auth: Bearer Token → `{{token}}`
  - Body (JSON): `{ "postId": "{{postId}}", "content": "Nice post!" }`
  - Tests (save the created id):
    ```javascript
    const json = pm.response.json();
    pm.test('comment id present', () => pm.expect(json?.data?.id).to.be.a('string'));
    pm.environment.set('commentId', json.data.id);
    ```

3) Delete own comment
  - Method: DELETE
  - URL: `{{baseUrl}}/api/comments/{{commentId}}`
  - Auth: Bearer Token → `{{token}}`
  - Expect: `{ success: true, data: { deleted: true } }`

4) Hide comment (admin moderation)
  - Method: POST
  - URL: `{{baseUrl}}/api/comments/{{commentId}}/hide`
  - Auth: Bearer Token → `{{adminToken}}`
  - Expect: `{ success: true, data: { hidden: true } }`

Tips:
- Ensure `{{postId}}` points to a valid published post (or any post you allow comments on).
- Use the login request’s Tests tab to store `{{token}}` and `{{adminToken}}` after logging in as the respective users.

### Milestone 4 (Admin APIs)
- `GET /api/admin/stats` → { totalMembers, totalPosts, publishedPosts, comments }
- `GET /api/admin/users?q=&status=&page=&limit=` → list users with search + pagination
- `GET /api/admin/users/:id` → get user details (username, role, status, profile)
- `GET /api/admin/posts?q=&author=&status=&tag=&page=&limit=` → list posts for moderation
- `POST /api/admin/users/:id/suspend` → suspend user
- `DELETE /api/admin/users/:id` → delete user
- Note: post approval endpoint also available via `POST /api/posts/:id/approve` (admin)

## Try it (PowerShell)

```powershell
# Login and get token
$body = @{ username='user1@example.com'; password='secret123' } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:5000/api/auth/login' -ContentType 'application/json' -Body $body
$token = $login.data.token

# Me
Invoke-RestMethod -Method Get -Uri 'http://localhost:5000/api/auth/me' -Headers @{ Authorization = "Bearer $token" } | ConvertTo-Json -Compress

# Update profile
$body = @{ name='User One'; bio='Hello there'; visibility='PUBLIC' } | ConvertTo-Json
Invoke-RestMethod -Method Put -Uri 'http://localhost:5000/api/users/me' -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $body | ConvertTo-Json -Compress

# Directory
Invoke-RestMethod -Method Get -Uri 'http://localhost:5000/api/users/directory?q=user&page=1&limit=5' | ConvertTo-Json -Compress
```

## Notes
- Keep only one dev server running (avoid EADDRINUSE on port 5000).

## Admin user

Seed or update an admin account quickly:

```powershell
cd backend
npm run seed:admin
```

Defaults:
- Username: `admin@example.com`
- Password: `secret123`

You can override via env vars when running the seed script:
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `ADMIN_FORCE_RESET_PASSWORD=true`

Log in with the admin to access protected admin routes and approve posts.