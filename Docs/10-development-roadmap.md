# Development Roadmap

Phased around the MoSCoW prioritization from the PRD.

## Phase 0 — Foundation (Week 1)
- Repo setup (Next.js 15, App Router, Tailwind)
- Supabase project: Auth + Postgres schema (`users`, `budgets`, `budget_categories`, `bookmarks`)
- Deployment pipeline to Vercel (staging + production)
- Design tokens implemented as CSS variables (from `09-design-system.md`)

## Phase 1 — Must Haves (Weeks 2–4)

2. Dashboard (default budget snapshot)
3. Budget Search
4. Charts & Visualization
5. AI Explain (Gemini integration + Redis caching)
6. Country/Year Comparison

**Milestone:** a logged-in user can search a budget, see a chart, get an AI explanation, and compare two years/countries end to end.

## Phase 2 — Core Differentiator (Weeks 5–6)
7. Budget Reallocation Simulator (client-side redistribution logic, slider UI, optional AI tradeoff explanation)

**Milestone:** the simulator is the product's signature interaction — prioritize polish here before moving to Should Haves.

## Phase 3 — Should Haves (Week 7)
8. Bookmarks
9. Dark Mode
10. Profile & Settings

## Phase 4 — Could Haves (Week 8+, as time allows)
11. Feedback
12. Profile 3D Visualizer (needs its own design spike first)
13. Community (needs its own design spike first)
14. Voice Assistant (needs its own design spike first)

## Explicitly Out of Scope (v1)
- Multiplayer / chat
- Marketplace

## Cross-Cutting Workstreams (run throughout)
- Testing (see `11-testing.md`) — unit + API tests written alongside each feature, not deferred
- Accessibility pass on every feature before it's marked done
- Analytics events instrumented per feature spec
- Admin panel — build minimally alongside Phase 1 (needed to seed/manage real budget data early)

## Suggested Team Cadence
- Each feature's full Feature Design Document (21 sections) is the handoff unit to an engineer or agent
- One feature = one PR/branch where practical
- Weekly review against `01-prd.md` success metrics once Phase 1 ships
