# Unijob

A web platform connecting students with verified employers, with moderation and admin tools.

> Team project (EXE201). Full commit history from the original team repository is preserved.

## Repository structure

```
BE/                 FastAPI REST API + PostgreSQL (Docker Compose)
FE/                 React + Vite web app (candidate, employer, admin, moderator)
```

## Tech stack

- **Frontend:** React, Vite, React Router, REST API
- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, Docker Compose
- **Integrations:** SendGrid (email OTP), VNPay Sandbox (payments), tax-code lookup

## Getting started

### Backend

Requirements: Python 3.10+, Docker Desktop.

```bash
cd BE
cp .env.example .env              # then fill in the values
docker compose up -d              # PostgreSQL :5432, pgAdmin :5050
python -m venv .venv
.venv/Scripts/activate            # Windows  (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
python -m uvicorn src.api.main:app --port 8000
```

API docs: http://localhost:8000/docs

> If port 5432 is already used (e.g. a local PostgreSQL install), set `DB_PORT=5433` in `BE/.env`.
> Docker Compose and the API both read it.

**Database migrations.** All time columns are `TIMESTAMPTZ`, so the API returns times with a UTC offset (`...+00:00`) and browsers show them in local time.
Job search (`GET /v1/job/search`) ignores Vietnamese accents through the Postgres `unaccent` extension.
If your database was created before these changes, run the migrations once (they are safe to run again):

```bash
cd BE
docker exec -i unijob_postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < src/db/migrations/001_timestamptz.sql
docker exec -i unijob_postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < src/db/migrations/002_unaccent.sql
```

### Frontend

Requirements: Node.js 20+.

```bash
cd FE
cp .env.example .env.local        # points the app at the local backend
npm install
npm run dev
```

App: http://localhost:5173

### Tests & lint

```bash
# Frontend: unit tests (Vitest) + ESLint
cd FE
npm test
npm run lint

# Backend: unit tests (pytest) + ruff (PEP 8)
cd BE
pip install -r requirements-dev.txt
python -m pytest
python -m ruff check src tests
```

Coding conventions:

- **FE**: components in PascalCase (file name = component name), functions and variables in camelCase, shared constants in UPPER_SNAKE_CASE. Pages live in lowercase folders under `src/pages/` (`candidate`, `employer`, `admin`, `moderator`). Use single quotes in JS, double quotes for JSX attributes, and always end statements with a semicolon. Colors and gradients come from `src/constants/colors.js`. Shared formatters live in `src/utils/`. ESLint enforces these rules (see `FE/eslint.config.js`).
- **BE**: PEP 8 with snake_case and a 120-character line limit, checked by ruff (`BE/ruff.toml`). Unit tests go in `BE/tests/unit/` and must not need a database.

## Team

| Member | Main contribution |
|---|---|
| Hoàng Văn Lập ([@schaffen2004](https://github.com/schaffen2004)) | Database, backend API |
| Dang-Manh Ho | Company verification, payments, AI services |
| Bùi Lâm Long Vũ ([@BLLVu120](https://github.com/BLLVu120)) | Frontend |

## License

MIT, see [LICENSE](LICENSE).
