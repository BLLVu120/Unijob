# Unijob

A web platform connecting students with verified employers, with moderation and admin tools.

> Team project (EXE201). Full commit history from the original team repository is preserved.

## Repository structure

```
BE/
├── Backend/        FastAPI REST API + PostgreSQL (Docker Compose)
└── ai_services/    Company scoring, fraud detection and payment services
FE/                 React + Vite web app (candidate, employer, admin, moderator)
```

## Tech stack

- **Frontend:** React, Vite, React Router, Context API, REST API
- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, Docker Compose
- **Integrations:** SendGrid (email OTP), payOS / SePay (payments), tax-code lookup

## Getting started

### Backend

Requirements: Python 3.10+, Docker Desktop.

```bash
cd BE
cp .env.example .env              # then fill in the values

cd Backend
docker compose up -d              # PostgreSQL :5432, pgAdmin :5050
python -m venv .venv
.venv/Scripts/activate            # Windows  (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
python -m uvicorn src.api.main:app --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

Requirements: Node.js 20+.

```bash
cd FE
cp .env.example .env.local        # points the app at the local backend
npm install
npm run dev
```

App: http://localhost:5173

### AI services

See [BE/ai_services/readme_instruction.md](BE/ai_services/readme_instruction.md). Copy `BE/ai_services/.env.example` to `.env` first.

## Team

| Member | Main contribution |
|---|---|
| Hoàng Văn Lập ([@schaffen2004](https://github.com/schaffen2004)) | Database, backend API |
| Dang-Manh Ho | Company verification, payments, AI services |
| Bùi Lâm Long Vũ ([@BLLVu120](https://github.com/BLLVu120)) | Frontend |

## License

MIT, see [LICENSE](LICENSE).
