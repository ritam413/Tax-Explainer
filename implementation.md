# Implementation Details

## Tech Stack
- **Framework:** Next.js 15 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, custom design tokens
- **Backend/DB:** Supabase (Postgres, Auth, Storage, RLS)
- **AI:** Gemini API
- **Cache:** Upstash Redis
- **Hosting:** Vercel
- **Testing:** Vitest/Jest, React Testing Library, Playwright, axe-core

## Data Fetching & State
- **Server State:** Handled via Server Components / Server Actions (for mutations).
- **Client State:** Kept minimal using `useState`/`useReducer`. The Budget Simulator logic runs entirely in-browser.
- **Caching:** Redis acts as a caching layer in front of Supabase and Gemini for performance.

## AI Integration
- Prompts are generated strictly from typed budget objects.
- Streaming responses (SSE/Vercel AI SDK) for token-by-token output.
- Cache keys include `promptVersion` to prevent stale data when prompt structures change.
- UI gracefully degrades if the AI fails.

## Coding Conventions
- Strict TypeScript.
- One component per file, colocated tests.
- Design tokens for styles; avoid inline magic numbers.
- Zod schemas for shared validation (client & server).

## Workflow & Task Tracking
- **Documentation First:** Before implementing any feature, ALWAYS refer to the corresponding spec in `Docs/Fetures/` to understand the full requirements, edge cases, and testing criteria. Additionally, consult the core architecture documents in `Docs/` (such as `06-api-design.md`, `07-components.md`, `08-pages.md`, and `09-design-system.md`) to ensure alignment with global project standards.
- **Progress Tracking:** Always tick off the completed items in `to-do.md` (`[x]`) after a feature is finished building and all success criteria from its documentation are met.
