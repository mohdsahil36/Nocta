# Phase 1 Build Plan — AI Plan Intelligence

> Start: 10 hrs from now. This file is the single source of truth for the build session.

---

## Goal

Give users an AI-drafted curriculum for any goal, keep it fresh with industry updates, and never let the agent overwhelm them by front-loading advanced topics over unfinished basics.

---

## Pacing principle (locked — applies to every slice)

> The agent never promotes advanced topics above unfinished foundational ones.

Enforced as a hard schema constraint, not a soft prompt suggestion.

---

## Slice 1 — Plan Bootstrap

**What it does:** User hits "Draft a plan" on a goal → AI returns an ordered curriculum → user edits/confirms → saves as real `PlanStep` rows.

### Data flow
```
Client
  → POST /goals/:goalId/plan/bootstrap  (Express)
  → proxy → POST /bootstrap-plan        (ai-backend)
  → LangChain chain
      input:  goal name + notes + user context
      output: ordered PlanStep[] with pacing metadata
  → returns DRAFT to client (nothing saved yet)
  → user edits / reorders / removes
  → confirms → POST /goals/:goalId/plan (existing route) saves steps
```

### Files to create

| Layer | File | What |
|---|---|---|
| Pydantic models | `ai-backend/models/plan_bootstrap.py` | `BootstrapRequest`, `PlanStepDraft` (title, description, estimatedMinutes, isFoundational, order), `BootstrapResponse` |
| Service | `ai-backend/services/plan_bootstrap.py` | LangChain chain with structured output; pacing guardrail in system prompt |
| Router | `ai-backend/routers/plan_bootstrap.py` | `POST /bootstrap-plan` mounted in `main.py` |
| Express service | `backend/src/services/goals/plan-bootstrap.service.ts` | HTTP call to ai-backend with timeout; typed request/response |
| Express controller | `backend/src/controller/goals/goal.controller.ts` | `bootstrapPlan` handler |
| Express route | `backend/src/routes/goals/goal.route.ts` | `POST /goals/:goalId/plan/bootstrap` |
| Frontend | Goals screen | "Draft a plan" button → draft review panel → confirm |

### Pacing guardrail in schema
Each `PlanStepDraft` has:
- `isFoundational: bool` — LLM must mark basics true
- `order: int` — foundational steps must come before advanced ones
- Validation: reject response where any `isFoundational=false` step has lower order than an unfinished `isFoundational=true` step

---

## Slice 2 — Plan Evolve (manual trigger)

**What it does:** User hits "Check for updates" on a goal → LangGraph agent searches the web → returns a suggested diff → user picks what to apply → confirms.

### Data flow
```
Client
  → POST /goals/:goalId/plan/evolve     (Express)
  → proxy → POST /evolve-plan           (ai-backend)
  → LangGraph agent
      Node 1 — fetch: load existing plan steps from request
      Node 2 — search: Tavily web search for goal topic trends
      Node 3 — reason: compare current plan vs findings
      Node 4 — suggest: produce diff (add/update/remove + sources)
      Node 5 — guardrail: reject suggestions that skip basics
  → returns EvolveResponse (suggestions[] with sources)
  → client shows suggestion panel: user selects, confirms
  → POST /goals/:goalId/plan applies confirmed changes
```

### New files over Slice 1

| Layer | File | What |
|---|---|---|
| Pydantic models | `ai-backend/models/plan_evolve.py` | `EvolveRequest` (goalId, topic, existingSteps[]), `EvolveSuggestion` (action: add/update/remove, step, reason, source), `EvolveResponse` |
| Service | `ai-backend/services/plan_evolve.py` | LangGraph graph with 5 nodes above; Tavily tool |
| Router | `ai-backend/routers/plan_evolve.py` | `POST /evolve-plan` |
| DB migration | `PlanSuggestion` table | id, goalId, userId, suggestions (JSON), status (pending/applied/dismissed), createdAt |
| Express | route + controller + service | `POST /goals/:goalId/plan/evolve` |
| Frontend | Goals screen | "Check for updates" button → suggestions panel |

### Env additions
```
TAVILY_API_KEY=
```

---

## Slice 3 — Daily background agent

**What it does:** Cron fires the Slice 2 LangGraph agent daily per active user. Saves suggestions silently. Notification badge on Goals screen.

### Data flow
```
node-cron (daily, existing scheduler in Express)
  → for each active user with active goals
  → POST /goals/:goalId/plan/evolve (internal call)
  → suggestions saved to PlanSuggestion table
  → client fetches pending suggestion count on Goals screen load
  → badge: "2 suggestions for System Design"
```

### New files over Slice 2

| Layer | File | What |
|---|---|---|
| Cron job | `backend/src/jobs/plan-evolve.job.ts` | daily scheduler; iterates active users + goals |
| Express route | `GET /goals/:goalId/plan/suggestions` | returns pending suggestions for a goal |
| Frontend | Goals screen | suggestion count badge; dismissal action |

**Zero new AI logic** — entirely reuses the Slice 2 LangGraph agent.

---

## Build order within the session

1. Pydantic schema (`BootstrapRequest`, `PlanStepDraft`, `BootstrapResponse`)
2. LangChain chain service + pacing guardrail
3. `POST /bootstrap-plan` router + mount in `main.py`
4. Express proxy service + controller + route
5. Frontend: "Draft a plan" button → draft panel → confirm
6. ✅ Slice 1 done
7. `PlanSuggestion` DB migration
8. LangGraph agent (5 nodes) + Tavily tool
9. `POST /evolve-plan` router
10. Express + frontend for Evolve manual trigger
11. ✅ Slice 2 done
12. Cron job + suggestions badge
13. ✅ Slice 3 done

---

## What NOT to do

- Do not save anything to the plan without user confirmation
- Do not let the agent reorder steps — it only suggests additions/updates/removals
- Do not scrape full course content — search for topic relevance only
- Do not run Slice 3 until Slice 2 is manually verified working
