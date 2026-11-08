# Nocta

> **Visual README →** [View the full interactive version](https://claude.ai/artifact/QND8AaY6Yi1oom8y9FxfYb)

**One meaningful action, every night.**

Nocta is a calm nightly priority-decision app for developers. After work, it scores what matters, picks a single next step, and protects rest when you need it — without turning life into another dashboard.

This repo holds the Nocta web app (and supporting API as the product grows).

## What it does (v1)

### Shipped end-to-end

- **Deterministic scoring** — priority from deadlines, neglect, weight, and momentum; pure TypeScript, unit-tested; no model involved
- **Goal CRUD** — add, edit, archive, and reactivate goals with weight, deadline, and next action
- **Plan steps** — ordered steps per goal; add, archive, restore; archived steps auto-purge after 45 days
- **Check-in** — minutes/energy input → deterministic rank → winning goal + next plan step returned to desk UI
- **Outcome logging** — confirm completed / partial / deferred / swapped after a session; updates `lastTouchedAt` and plan step status
- **AI log parser** — free-text outcome entry → structured outcome fields (few-shot, Groq); confirm-before-save
- **AI recommendation reasoning** — LLM narrates the top pick from scorer numbers only; streamed to desk UI; Pydantic-validated; never changes the rank
- **`nocta-ai` service** — FastAPI + Pydantic; `/health`, log parser, and reasoning endpoints; deployed on Render; Express proxies to it
- **CI** — pytest (`ai-backend`) + frontend/backend typecheck on every push (GitHub Actions)
- **Dashboard** — activity stats (streak, longest streak, today's count) from real platform commit data

### In progress

- **Token / latency / cost logging** — instrument every LLM call from first use
- **Provider abstraction** — swap Groq → OpenAI / Anthropic / local model per feature via env config

### Planned

- **Feasibility walk** — use minutes/energy to size tonight's step; does not change rank order
- **AI plan bootstrap** — goal name + notes → ordered plan draft; user confirms before save
- **Eval harness** — labeled cases for log parser (field accuracy) and reasoning (contradiction rate vs scorer)
- **Embeddings + pgvector** — embed logs/reflections; metadata-filtered semantic search
- **RAG weekly reflection** — retrieval-augmented narration over outcome logs
- **Output guardrails** — validate LLM output against deterministic score; reject contradictions
- **Observability** — tracing (Langfuse), cost-per-check-in dashboard, prompt version tags
- **Provider fallback** — circuit breaker; if LLM is down, return scorer pick with no narration

## Stack

| Layer | Tech |
|--------|------|
| App | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, Shadcn / Base UI, Motion, Lenis |
| State | TanStack Query (server), Zustand (ephemeral UI only) |
| Auth | Clerk (planned) |
| Backend | Express, Zod, Prisma, PostgreSQL (Supabase) |
| AI service | Python 3.12, FastAPI, Pydantic, Groq (LLM) |

## Structure

```
nocta/   (this repo)
├── package.json   # Root: Husky + shared typecheck scripts
├── frontend/      # Next.js app — landing, auth surface, product UI
├── backend/       # Express API + Prisma
├── ai-backend/    # Python FastAPI — LLM narration, log parser, embeddings (Phase 1+)
├── .github/       # CI workflows
└── graphify-out/  # Optional local code knowledge graph
```

## Getting started

### Prerequisites

- Node.js 20+ (22.x recommended for backend)
- Python 3.9+
- PostgreSQL / Supabase (when using the API)

### Install

Root install sets up **Husky** git hooks only. Frontend and backend still need their own installs:

```bash
# repo root — Husky + root scripts
npm install

cd frontend && npm install
cd ../backend && npm install
```

### Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Backend

Add `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
NOCTA_AI_URL=https://<your-render-service>.onrender.com
```

Then:

```bash
cd backend
npx prisma migrate dev
npm run dev
```

API defaults to port **3001**. Point the app at it with `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.

### AI backend

**Deployed on Render** — `https://<your-render-service>.onrender.com`

Render config:
- **Root directory:** `ai-backend`
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

Render env vars:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | your Groq API key |
| `CORS_ORIGINS` | frontend URL e.g. `https://your-app.vercel.app` |
| `APP_NAME` | `nocta-ai` |

> Do **not** set `PORT` — Render injects it automatically.

> **Provider abstraction is in progress.** Currently hardwired to Groq. A future `PROVIDER` / `MODEL` env var will allow swapping to OpenAI, Anthropic, or a local model per feature without code changes.

After deploy, hit `GET /health` to verify. Then set `NOCTA_AI_URL` in the Express backend env to the Render service URL.

**Local development** — copy `.env.example` to `.env` and fill in `GROQ_API_KEY`:

```env
APP_NAME=nocta-ai
PORT=8000
CORS_ORIGINS=http://localhost:3000
GROQ_API_KEY=your_groq_api_key_here
```

```bash
cd ai-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

AI service runs on port **8000** locally. Hit `/health` to verify.

## Quality gates

Type errors (the kind that fail Vercel `next build`) are caught before deploy:

| Gate | When | What |
|------|------|------|
| `npm run typecheck` | Anytime (repo root) | Frontend + backend `tsc --noEmit` |
| Husky **pre-push** | `git push` | Same typecheck; push blocked on failure |
| GitHub Actions CI | Push / PR to `main` or `develop` | Frontend + backend typecheck |

No extra step is required before every commit. Run typecheck locally when you want an early check; Husky enforces it on push.

```bash
# from repo root
npm run typecheck
```

## Scripts

**Root**

| Command | Description |
|---------|-------------|
| `npm install` | Install Husky; enable git hooks (`prepare`) |
| `npm run typecheck` | Typecheck frontend then backend |
| `npm run typecheck:frontend` | Frontend only |
| `npm run typecheck:backend` | Backend only |

**Frontend** (`cd frontend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run typecheck` | `next typegen` then `tsc --noEmit` |
| `npm run lint` | ESLint |

**Backend** (`cd backend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (nodemon + tsx) |
| `npm run build` | Compile TypeScript |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run start` | Run compiled server |

## Product notes

- Landing copy lives in `frontend/app/login/content.ts`
- Theme can follow local evening hours, with a manual override
- Real auth / session is deferred; the start CTA is UI-ready but not wired yet
- Keep `.env` and secrets out of git

## License

Private / unpublished unless otherwise specified.
