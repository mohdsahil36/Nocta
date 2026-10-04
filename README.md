# Nocta

**One meaningful action, every night.**

Nocta is a calm nightly priority-decision app for developers. After work, it scores what matters, picks a single next step, and protects rest when you need it — without turning life into another dashboard.

This repo holds the Nocta web app (and supporting API as the product grows).

## What it does (v1)

- **Deterministic scoring** — priority from deadlines and neglect, not a model guessing
- **One action, not a list** — each night ends with a single next step
- **Weekly reflection** — short pattern check, not a metrics circus
- **Recovery nights** — rest is a valid, protected choice
- **Neglected-area tracking** — quiet categories surface when ignored too long

## Stack

| Layer | Tech |
|--------|------|
| App | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, Shadcn / Base UI, Motion, Lenis |
| State | TanStack Query (server), Zustand (ephemeral UI only) |
| Auth | Clerk (planned) |
| Backend | Express, Zod, Prisma, PostgreSQL (Supabase) |

## Structure

```
nocta/   (this repo)
├── package.json   # Root: Husky + shared typecheck scripts
├── frontend/      # Next.js app — landing, auth surface, product UI
├── backend/       # Express API + Prisma
├── .github/       # CI workflows
└── graphify-out/  # Optional local code knowledge graph
```

## Getting started

### Prerequisites

- Node.js 20+ (22.x recommended for backend)
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
```

Then:

```bash
cd backend
npx prisma migrate dev
npm run dev
```

API defaults to port **3001**. Point the app at it with `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.

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
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
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
