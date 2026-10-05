# Haan — Phase 1 prototype

Admin dashboard for a simple, deterministic loan assessment demo. All data is synthetic; the rules are demo rules, not real lender rules.

## Run locally

Requires PostgreSQL running locally.

```bash
createdb haan            # default DATABASE_URL is postgresql+psycopg:///haan

# backend (http://localhost:8000) — creates tables and seeds 8 users on first start
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --port 8000

# frontend (http://localhost:5173) — proxies /api to the backend
cd frontend
npm install && npm run dev
```

Set `DATABASE_URL` to use a different database. To reset the demo data, drop and recreate the `haan` database.

## Layout

- `backend/app/engine.py` — all decision logic (4 rules, remediation text)
- `backend/app/main.py` — API routes (`/api/users`, `/api/applications`, `/api/applications/{id}/assess`, ...)
- `backend/app/seed.py` — the 8 dummy users
- `frontend/src` — React pages; no decision logic here
