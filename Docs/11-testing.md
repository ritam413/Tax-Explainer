# Testing Strategy

## 1. Testing Layers
| Layer | Tool (suggested) | Scope |
|---|---|---|
| Unit | Vitest / Jest | Pure functions: validation, redistribution math, cache key generation, formatters |
| API | Vitest + Supertest (or Next.js route testing) | Every API route in `06-api-design.md` |
| Component | React Testing Library | Interactive components: Sector Slider, AI Response Card, Search |
| E2E | Playwright | Core user journeys from `03-user-flow.md` |
| Accessibility | axe-core (automated) + manual screen reader pass | Every shipped screen |

## 2. Per-Feature Unit/API Coverage (consolidated from feature specs)

### Authentication
- Unit: email validation, password strength
- API: `POST /signup` (valid/duplicate/invalid), `POST /login` (valid/invalid/rate-limited), `PATCH /forgot-password`

### Dashboard
- Unit: default sector resolution, cache-hit vs cache-miss branching
- API: `GET /budgets` (default), `GET /bookmark`, `GET /budgets/:id`

### Budget Search
- Unit: query debounce logic, filter combination logic
- API: `GET /budgets` (query only, query+filters, no matches), `GET /budgets/:id`

### AI Explain
- Unit: prompt construction from budget data, cache key generation
- API: `POST /ai/explain` (valid/invalid id, cached/uncached), `POST /chat` (valid follow-up, rate-limited)

### Charts & Visualization
- Unit: data transformation (raw → chart format), "Other" grouping for long-tail categories
- API: `GET /budgets/:id` (chart-ready response), `GET /budgets` (aggregated)

### Comparison
- Unit: compare function, growth calculation, percentage logic
- API: `GET /budgets`, `POST /compare`, `POST /ai/explain`

### Budget Simulator
- Unit: zero-sum redistribution logic, min/max clamping per sector, reset restores exact baseline
- API: `GET /budgets/:id` (baseline), `POST /ai/explain` (simulated delta payload)

### Bookmarks
- Unit: toggle logic (add vs remove), duplicate prevention
- API: `POST /bookmark` (valid/duplicate/unauthenticated), `DELETE /bookmark`, `GET /bookmark`

### Profile & Settings
- Unit: field validation, theme persistence logic
- API: `GET /profile`, `PATCH /profile` (valid/invalid/unauthenticated)

### Feedback
- Unit: message validation (empty, too long), category requirement
- API: `POST /feedback` (valid/guest/logged-in/rate-limited)

## 3. E2E Scenarios (Playwright)
1. Sign up → land on Dashboard → see default snapshot
2. Search a sector → view Charts + AI Explain
3. Run a Comparison between two years → see AI summary → export
4. Drag Simulator slider → verify affected sectors update and total stays balanced → reset
5. Bookmark an item → confirm it appears in Bookmarks list → remove it
6. Toggle Dark Mode → confirm persists across reload
7. Submit Feedback as a guest (no login)

## 4. Non-Functional Testing
- **Performance:** Dashboard and Search must respond in <2s under normal load (measured via Lighthouse/Web Vitals in CI)
- **Accessibility:** automated axe scan on every page + manual keyboard-only pass before each release
- **Resilience:** simulate Gemini API down, Redis down, Supabase down — verify graceful fallbacks defined in each feature spec's "Error" state

## 5. CI Gate
- All unit + API tests must pass before merge
- E2E suite runs on staging before promotion to production
- No feature is marked "done" without its corresponding tests from this document
