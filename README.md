# DigiBank — Digital Banking System

A full-stack digital banking app: users open an account, deposit, withdraw, transfer money to other accounts, save beneficiaries and browse their transaction history.

## Live Demo

| | URL |
|---|---|
| Frontend | `https://YOUR-FRONTEND.vercel.app` <!-- TODO: add link --> |
| Backend API | `https://YOUR-BACKEND.onrender.com` <!-- TODO: add link --> |
| Health check | `https://YOUR-BACKEND.onrender.com/health` |

> The backend runs on Render's free plan, so the first request after a period of inactivity can take 30–60 seconds while the server wakes up.

## Features

- Register / login with JWT authentication and bcrypt-hashed passwords
- Each user automatically gets a bank account with a unique account number
- Deposit, withdraw and transfer — every money movement runs inside a database transaction with row locking (`SELECT ... FOR UPDATE`), so balances stay correct even under concurrent requests
- Beneficiaries with one-click "Send"
- Paginated transaction history
- Profile update and password change
- Rate limiting on login/register

## Tech Stack

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | React 19, Vite, React Router, Axios, lucide-react | Vercel |
| Backend | Node.js, Express 5, JWT, bcryptjs, express-rate-limit | Render |
| Database | PostgreSQL (`pg` driver, `node-pg-migrate` migrations) | Neon |

## Project Structure

```
├── backend/
│   ├── config/db.js          # PostgreSQL connection pool (DATABASE_URL)
│   ├── controllers/          # Request handlers
│   ├── middleware/           # JWT auth, rate limiter
│   ├── migrations/           # SQL migrations (node-pg-migrate)
│   ├── models/               # SQL queries
│   ├── routes/               # API routes
│   ├── app.js                # Express app (CORS, routes, /health)
│   └── server.js             # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/axios.js      # Axios instance (VITE_API_URL)
│   │   ├── components/
│   │   ├── context/          # Auth context
│   │   └── pages/
│   └── vercel.json           # SPA rewrites for React Router
└── render.yaml               # Render blueprint for the backend
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require` | Neon connection string |
| `JWT_SECRET` | Yes | long random string | Secret used to sign login tokens |
| `JWT_EXPIRES_IN` | Yes | `1d` | Token lifetime |
| `FRONTEND_URL` | Production | `https://YOUR-FRONTEND.vercel.app` | Allowed CORS origin(s), comma-separated. Empty = allow all |
| `PORT` | No | `5000` | Set automatically by Render |

### Frontend (`frontend/.env`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `VITE_API_URL` | Yes | `https://YOUR-BACKEND.onrender.com/api` | Backend API base URL, must end with `/api` |

Copy `backend/.env.example` and `frontend/.env.example` to `.env` and fill in the values. `.env` files are git-ignored — never commit real secrets.

Generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Run Locally

Requires Node.js 20.11+ and a PostgreSQL database (a free Neon branch works well for development).

```bash
# Backend
cd backend
cp .env.example .env      # fill in DATABASE_URL and JWT_SECRET
npm install
npm run migrate           # create tables
npm run dev               # http://localhost:5000

# Frontend (in a second terminal)
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

### Database migrations

| Command | What it does |
|---|---|
| `npm run migrate` | Apply all pending migrations (also used in production) |
| `npm run migrate:down` | Roll back the last migration |
| `npm run migrate:create -- <name>` | Create a new SQL migration file |

## Deployment

Deploy in this order: **Neon → Render → Vercel**, then update CORS.

### 1. Database — Neon

1. Create a project at [neon.tech](https://neon.tech).
2. Open **Connect** and copy the connection string (it includes `sslmode=require`). This is your `DATABASE_URL`.

Tables are created automatically by the Render build (`npm run migrate`), so nothing else is needed here.

### 2. Backend — Render

1. In Render, choose **New → Blueprint** and select this repository. Render reads `render.yaml`:
   - Root directory: `backend`
   - Build command: `npm ci && npm run migrate`
   - Start command: `npm start`
   - Health check: `/health`
2. Fill in the environment variables when asked:
   - `DATABASE_URL` — the Neon connection string
   - `FRONTEND_URL` — leave a placeholder for now; set it after step 3
   - `JWT_SECRET` is generated automatically; `JWT_EXPIRES_IN` defaults to `1d`
3. Deploy, then open `https://YOUR-BACKEND.onrender.com/health` — it should return `{"status":"OK"}`.

### 3. Frontend — Vercel

1. In Vercel, **Add New → Project** and import this repository.
2. Set **Root Directory** to `frontend` (framework: Vite).
3. Add the environment variable `VITE_API_URL` = `https://YOUR-BACKEND.onrender.com/api`.
4. Deploy.

### 4. Connect them

1. In Render → your service → **Environment**, set `FRONTEND_URL` to your Vercel URL (no trailing slash) and save. Render redeploys automatically.
2. (Optional) In [UptimeRobot](https://uptimerobot.com), add an HTTP monitor for `https://YOUR-BACKEND.onrender.com/health` every 5 minutes to keep the free server awake. The route does not touch the database, so it does not use Neon compute time.

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| POST | `/api/auth/register` | — | Create user + bank account |
| POST | `/api/auth/login` | — | Get a JWT |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/accounts/me` | ✓ | Account details and balance |
| POST | `/api/transactions/deposit` | ✓ | `{ amount }` |
| POST | `/api/transactions/withdraw` | ✓ | `{ amount }` |
| POST | `/api/transactions/transfer` | ✓ | `{ receiverAccountNumber, amount }` |
| GET | `/api/transactions?page=1&limit=10` | ✓ | Transaction history |
| GET / POST | `/api/beneficiaries` | ✓ | List / add beneficiaries |
| DELETE | `/api/beneficiaries/:id` | ✓ | Remove a beneficiary |
| GET / PUT | `/api/profile` | ✓ | View / update profile |
| PUT | `/api/profile/password` | ✓ | Change password |
