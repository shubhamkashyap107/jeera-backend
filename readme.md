# 15/9/26

- create auth router, use it
- make login api (/api/auth/login)
- make logout api (/api/auth/logout)
- make me api (/api/auth/me)
- use jwt, cookies, proper error handling, bcrypt
## Deploying on Render (Web Service)

- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`
- Environment variables (see `.env.example`):
  - `DB_URL` — MongoDB connection string (allow Render's IPs / `0.0.0.0/0` in Atlas Network Access)
  - `JWT_SECRET` — long random string
  - `CLIENT_URL` — the deployed frontend URL, e.g. `https://jeera.onrender.com` (comma separate to allow several; no trailing slash)
  - `PORT` is set by Render automatically
