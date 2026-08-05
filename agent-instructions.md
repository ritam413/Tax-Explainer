# 2-Day Implementation Roadmap (Agent-Built)

Design is done. Build is delegated to AI agents working from the docs in this folder. This roadmap sequences the agent handoffs so dependencies don't block each other, and defines what "done" means at each checkpoint since no human is watching the clock tick by.

## In Scope
1. Dashboard (ring stat, top sectors)
3. Search + the disassemble interaction (pie → select → enlarge → explain → slider)
4. AI Explain (real Gemini call; templated fallback if the agent can't get a working key/response loop quickly)
5. Budget Simulator slider (same slider already in the Search panel — one implementation, not two)
6. Deploy to Vercel
7. Dark Mode

## Out of Scope
Compare, Bookmarks, Profile/Settings, Feedback, Admin, Redis caching, anything marked Could/Won't Have in `01-prd.md`.

If an agent runs into trouble, it should degrade AI Explain to templated copy before touching the disassemble interaction — that interaction is the product's signature moment and is not negotiable scope.

---

## Handoff Sequence

### Batch 1 — parallel, no dependencies
Hand these to separate agents at the same time; none blocks the others.

**Agent A — Scaffold & deploy pipeline**
- Input: `13-tech-spec.md` (project structure), `12-deployment.md`
- Output: Next.js + Tailwind + TypeScript repo matching the structure in `13-tech-spec.md`, deployed empty shell live on Vercel
- Done when: a blank deploy is reachable at a public URL

**Agent B — Database + seed data**
- Input: `05-database-schema.md`
- Output: Supabase project with `users`, `budgets`, `budget_categories` tables, seeded with one real dataset (India FY 2025–26, ~6 sectors matching the mockup figures)
- Done when: `GET /budgets` (or direct Supabase query) returns the seeded rows

**Agent C — Design tokens**
- Input: `09-design-system.md`
- Output: tokens ported to CSS variables / Tailwind config; 4 shared primitives built (Card, Button, Pill/Badge, Tag)
- Done when: primitives render correctly against every token in Section 2–6 of the doc

### Batch 2 — depends on Batch 1
**Agent E — Dashboard**
- Input: Agent A + B + C outputs, `feature-02-dashboard.md`, `08-pages.md`
- Output: Dashboard route with ring stat, hero number, top-sector cards, sidebar (status pill, sector bars, action buttons — Compare/Bookmark buttons render disabled/no-op)
- Done when: matches the Dashboard mockup with real seeded data instead of mock data

### Batch 3 — the centerpiece, depends on Batch 2
**Agent F — Search + disassemble interaction**
- Input: the working interactive mockup from this conversation (SVG pie, explode-on-search, enlarge panel) as the reference implementation, `feature-05-charts-visualization.md`, `09-design-system.md` Section 9
- Output: same interaction, wired to real seeded data instead of hardcoded mock data
- Done when: it feels identical to the mockup, just data-driven
- Note to agent: port the mockup's behavior closely — do not redesign the interaction, only re-source its data

**Agent G — AI Explain**
- Input: `feature-04-ai-explain.md`, Agent F's output (needs the selected-sector data shape)
- Output: structured Gemini prompt per sector → explanation swapped into the panel where the mockup's canned text sits
- Done when: real AI text renders; falls back to 4–5 hand-written templated explanations if Gemini integration isn't working within its time-box
- Time-box: if not working after a bounded number of attempts, ship the fallback and flag it rather than blocking downstream agents

### Batch 4 — depends on Batch 3
**Agent H — Simulator slider**
- Input: `feature-10-budget-simulator.md` Section 12 (zero-sum redistribution logic), Agent F's Search screen
- Output: the existing slider wired to real redistribution math; pie/legend updates live as it moves
- Done when: dragging one sector's slider visibly and correctly adjusts the others, total stays constant

**Agent I — States, responsive, accessibility, copy**
- Input: `11-testing.md` (states per feature), `09-design-system.md` Section 10
- Output: loading skeletons, empty/error states, mobile collapse below ~768px, visible focus rings, verb-first sentence-case copy throughout, no color-only state indicators
- Done when: a fresh user can complete the full loop on both desktop and one real mobile device without visible breakage

### Batch 5 — final
**Agent J — Deploy + smoke test**
- Input: all prior outputs
- Output: production deploy, full click-through test (dashboard → search → disassemble → explain → simulate) run and logged
- Done when: the click-through passes end to end on the public URL

---

## Ground Rules for the Agents
- No agent adds scope beyond its assigned feature doc — new ideas get logged for a future sprint, not built now
- Each agent commits and deploys its own output before handing off, so there's always a working version to fall back to
- If an agent's output doesn't match its "Done when" criterion, the orchestrating process re-runs that agent rather than letting the next batch start on an incomplete dependency
- Batch order is a dependency order, not a time estimate — batches can compress if agents run in parallel and finish early
