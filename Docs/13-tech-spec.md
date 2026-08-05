# Technical Specification

Companion to `01-prd.md` (what to build) — this covers *how* it's built: conventions, folder structure, state management, and implementation details an engineer/agent needs before writing code.

## 1. Tech Stack (recap)
- **Framework:** Next.js 15 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, design tokens from `09-design-system.md`
- **Backend/DB:** Supabase (Postgres, Auth, Storage, RLS)
- **AI:** Gemini API
- **Cache:** Upstash Redis
- **Hosting:** Vercel
- **Testing:** Vitest/Jest, React Testing Library, Playwright, axe-core

## 2. Project Structure
```
budget-explainer/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── forgot-password/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── search/
│   │   ├── budget/[id]/
│   │   ├── compare/
│   │   ├── bookmarks/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── admin/
│   ├── api/
│   │   ├── budgets/
│   │   ├── compare/
│   │   ├── ai/
│   │   │   ├── explain/
│   │   │   └── chat/
│   │   ├── bookmark/
│   │   ├── profile/
│   │   └── feedback/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/              # Navbar, Sidebar, Button, Input, Modal, Toast, etc.
│   ├── charts/           # Chart Card + chart-type components
│   ├── ai/                # AI Response Card, chat thread
│   └── simulator/         # Sector Slider, impact list
├── lib/
│   ├── supabase/          # client + server Supabase instances
│   ├── redis/              # cache get/set helpers
│   ├── gemini/              # prompt builders + API wrapper
│   └── utils/                # formatters, validators
├── types/                     # shared TypeScript types (Budget, Comparison, etc.)
├── tests/
│   ├── unit/
│   ├── api/
│   └── e2e/
└── docs/                        # this folder
```

## 3. State Management
- **Server state** (budgets, comparisons, AI responses): fetched via Server Components / Server Actions where possible; client-side fetching only for interactive/real-time pieces (e.g. Simulator).
- **Client state**: React `useState`/`useReducer` for local UI state (modals, form inputs, slider position). No global client state library needed at this scope — if cross-page client state grows (e.g. shared theme, simulator draft), use React Context.
- **Simulator state**: fully client-side, ephemeral. Baseline data fetched once, all redistribution math computed in-browser (see `04-*` and `feature-10-budget-simulator.md`). Never sent to the server except when explicitly requesting an AI tradeoff explanation.
- **Theme (dark mode)**: stored in `users.theme_preference` (Supabase) for logged-in users, applied via a `data-theme` attribute on `<html>`; falls back to system preference for guests, held in React state only (not localStorage, per environment constraints).

## 4. Data Fetching Conventions
- Use Server Actions for mutations (bookmark add/remove, profile update, feedback submit) instead of manual `fetch` where the component is server-rendered.
- Use route handlers (`app/api/**/route.ts`) for anything the client needs to call directly (Simulator's on-demand AI explain, streaming chat).
- All list-returning endpoints paginate (`page`, `limit`), per `06-api-design.md`.
- Every fetch that hits Supabase or Gemini checks Redis first, per the cache table in `06-api-design.md`.

## 5. AI Integration Details
- **Prompt construction:** structured, not freeform — always build prompts from typed budget objects (category, amount, prior year, growth %), never from raw user text alone, to keep explanations grounded.
- **Streaming:** AI Explain and Chat responses stream token-by-token to the client (Server-Sent Events or the Vercel AI SDK's streaming response helper).
- **Caching key:** `ai_explain:{budget_id}:{promptVersion}` — bump `promptVersion` whenever the prompt template changes, so stale explanations don't leak through after a prompt rewrite.
- **Fallback:** every AI-dependent UI must render usefully without AI (charts/data still shown) — see each feature's "Error" state.

## 6. Error Handling Conventions
- All API routes return `{ error: { code, message } }` on failure (per `06-api-design.md`).
- Client-side: a shared `<ErrorBoundary>` wraps each route segment; feature-level errors (e.g. AI down) degrade in place rather than breaking the whole page.
- Toast is the default surface for transient errors; inline messages for form-field-level errors.

## 7. Validation
- Shared Zod schemas in `types/` used on both client (form validation) and server (API route validation) to avoid drift.
- Server-side validation is authoritative; client-side is for UX speed only.

## 8. Coding Conventions
- TypeScript strict mode on.
- Components: function components, one component per file, colocated tests where practical (`Component.tsx` + `Component.test.tsx`).
- Naming: `camelCase` for functions/variables, `PascalCase` for components/types, `kebab-case` for file/route segments.
- No inline magic numbers for spacing/color — always reference design tokens from `09-design-system.md`.
- Every new feature ships with: the route, the component(s), the API route (if needed), unit/API tests per `11-testing.md`, and an update to `02-features.md`'s spec-status column.

## 9. Environment & Secrets
See `12-deployment.md` Section 5 for the full environment variable list. Never import server-only clients (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) into client components.

## 10. Definition of Done (per feature)
A feature is done when:
- [ ] Matches its Feature Design Document (all 21 sections addressed)
- [ ] Unit + API tests pass (per `11-testing.md`)
- [ ] Accessibility pass complete (keyboard nav, ARIA, contrast)
- [ ] Error/empty/loading states implemented, not just the happy path
- [ ] Analytics events wired
- [ ] Reviewed against `09-design-system.md` tokens (no ad-hoc colors/spacing)
