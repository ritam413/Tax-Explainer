## Phase 9: End-to-End System Testing, Accessibility & Deployment (Hours 44:00 – 48:00)

### Completed Deliverables
- [x] Installed Vitest v4.1.10, @vitest/coverage-v8, @testing-library/react, @testing-library/jest-dom, @vitejs/plugin-react, jsdom, zod as devDependencies (140 packages, 0 vulnerabilities).
- [x] Created `vitest.config.ts` with React plugin, jsdom environment, `@/` path alias, and v8 coverage provider.
- [x] Created `vitest.setup.ts` and added `test`, `test:watch`, `test:coverage` scripts to `package.json`.
- [x] Rewrote `lib/utils/simulator.test.ts` from console.assert to Vitest describe/it/expect — **26 tests**: initializeSimulationState, reallocateZeroSum (zero-sum, extreme drag, floor guard, locking, sequential ops), enforcePrecision (Hamilton rounding), getSimulationDeltas.
- [x] Created `lib/gemini/client.test.ts` — **32 tests**: all 4 prompt builders + getGeminiClient null/placeholder guard.
- [x] Created `lib/budget/service.test.ts` — **37 tests**: Zod schema validation (SectorBudget, BudgetDataset, CompareRequest), sanitizeBudgetDataset (NaN/zero-div/unit/growth guards), compareBudgets (identical/different/discontinued/new sectors).
- [x] **All 95 unit tests PASS** — `npm run test` exits 0.
- [x] Added `:focus-visible` keyboard focus ring (`2px solid #7fee64`) to `app/globals.css` for all interactive elements.
- [x] Added `role="status"`, `aria-live="polite"`, `aria-busy`, `aria-label` to `AiResponseCard.tsx` streaming container.
- [x] Added `aria-label`, `aria-busy` to AiTradeoffCard trigger button; `role="status"`, `aria-live`, `aria-busy` to output container.
- [x] Added `aria-pressed`, `aria-label` to lock toggle button; `aria-valuemin/max/now/text`, `aria-disabled`, `aria-label` to range input in `SectorSlider.tsx`.
- [x] `npx tsc --noEmit` — **0 TypeScript errors**.
- [x] `npm run build` — **SUCCESS** (Turbopack, 79s compile, 18 routes, 0 errors, 0 warnings).

### Phase 9 Build Output
- **Static routes (○)**: `/`, `/budgets`, `/compare`, `/simulator`, `/bookmarks`, `/profile`, `/settings`, `/_not-found`
- **Dynamic API routes (ƒ)**: `/api/ai/explain`, `/api/chat`, `/api/compare`, `/api/dashboard`, `/api/budgets`, `/api/bookmark`, `/api/profile`, `/api/health`

### Phase 9 Verification Checklist
- [x] **TypeScript**: `npx tsc --noEmit` → 0 errors
- [x] **Unit Tests**: 95/95 pass (simulator math, AI prompts, Zod schema validation)
- [x] **Production Build**: `npm run build` → clean Turbopack build, 18 routes, 0 errors
- [x] **Focus Rings**: `:focus-visible` lime glow on all interactive elements
- [x] **ARIA Live Regions**: AI streaming containers announce tokens via `aria-live="polite"`
- [x] **Slider ARIA**: Full `aria-value*` + `aria-pressed` on lock toggle

---

## Phase 5: Core Differentiator — Budget Reallocation Simulator (Hours 24:00 – 31:00)

### Completed Deliverables
- [x] Extended `types/budget.ts` with `SimulatedSector`, `SimulationState`, and `TradeoffExplainPayload` interfaces.
- [x] Built client-side zero-sum redistribution engine in `lib/utils/simulator.ts` (<10ms execution, proportional reallocation across un-locked sectors, floor clamping >= 0.0).
- [x] Enforced Hamilton/Hare-Niemeyer largest-remainder rounding method to guarantee total percentage sum equals exactly 100.00% and total budget equals baseline sum to 2 decimal places.
- [x] Extended Gemini prompt builders (`buildTradeoffPrompt`) and `POST /api/ai/explain` API route to handle simulation deltas with cache bypass for dynamic user inputs.
- [x] Built `SectorSlider.tsx` component with drag-to-adjust sliders, live percentage/amount readouts, delta badges, and sector budget locking toggles.
- [x] Built `SimulatorChart.tsx` component with `requestAnimationFrame` frame-throttling to guarantee smooth visual chart updates up to 60fps max.
- [x] Built `AiTradeoffCard.tsx` component with SSE token streaming, error isolation (AI errors do not reset or mutate slider state), and clear policy tradeoff summaries.
- [x] Created `app/simulator/page.tsx` page with dataset selectors, baseline overview metrics, lock tracking, and one-click Reset baseline controls.
- [x] Updated navigation components (`Navbar.tsx`, `Sidebar.tsx`, `MobileMenu.tsx`) pointing to `/simulator`.
- [x] Created unit tests `lib/utils/simulator.test.ts` verifying extreme dragging (0% / 100%), multi-sector drag sequences, zero-sum totals, sector locking, and `sec-zero-demo` (0.00 baseline) edge cases.
- [x] Verified zero TypeScript compilation errors via `npx tsc --noEmit`.

### Phase 5 Verification Checklist
- [x] **Extreme Dragging:** Dragging sliders to 0% or 100% never produces negative budgets or NaN amounts. Verified via unit tests and floor clamp logic.
- [x] **Multi-Sector Dragging:** Sequential adjustments recompute deltas correctly against updated baselines while respecting active locks.
- [x] **Floating-Point Precision:** Enforced exact rounding so sum of all sector percentages always equals 100.00% of baseline.
- [x] **AI Tradeoff Error Isolation:** Failure or latency of AI tradeoff explanation does not block or reset active slider state.

---

## ⚠️ Open Issues & Follow-Up Items (ON HOLD)

- [ ] **ISSUE-01: Budget Search End-to-End Testing Pending**
  - **Description**: Budget Search query integration with `GET /api/budgets?query=...` and AI explanation card rendering under dynamic search queries has not been fully end-to-end tested yet.
  - **Status**: **ON HOLD** (Preserved as open per explicit instructions; scheduled for follow-up testing).

---

## Phase 3 Completed Tasks
- [x] Initialized Phase 3 planning and received user approval on implementation plan.
- [x] Integrated `@google/genai` client in `lib/gemini/client.ts` with strict hallucination safeguards and prompt builders.
- [x] Enhanced `lib/redis/client.ts` with 7-day TTL caching (`ai_explain:{budget_id}:{version}`) and sliding window rate limiter.
- [x] Built SSE streaming API route `POST /api/ai/explain` with Redis caching, rate limiting, and `AbortSignal` stream interruption handling.
- [x] Built SSE streaming API route `POST /api/chat` supporting up to 3 follow-ups per session.
- [x] Created `components/ui/Toast.tsx` for accessible service outage notifications.
- [x] Created `components/ai/AiResponseCard.tsx` with typing indicator, token streaming, ARIA live region updates, and fallback.
- [x] Integrated `AiResponseCard` in the Budget Explorer page (`app/budgets/page.tsx`).
- [x] Standardized pie chart slice labeling with uniform radial callout lines, leader dots, category names, amounts, and percentages.
