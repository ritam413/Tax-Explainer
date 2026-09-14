# Tx Expliner 🏛️⚡

> **AI-Powered Government Budget Explainer & Simulator**  
> *Turning dense government budget PDFs into instant, plain-language visual insights in under 5 seconds.*

---

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Groq SDK](https://img.shields.io/badge/Groq_SDK-Llama_3.3_70B-F05032?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![Upstash Redis](https://img.shields.io/badge/Upstash-Redis_Cache-00E599?style=for-the-badge&logo=redis&logoColor=black)](https://upstash.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Recharts](https://img.shields.io/badge/Recharts-3.10-22B5BF?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://recharts.org/)
[![Vitest](https://img.shields.io/badge/Vitest-95_Tests_Passing-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🌟 Overview

Government budget documents are notoriously dense, spans hundreds of pages of complex financial jargon, and remain inaccessible to everyday citizens. **Tx Expliner** bridges this gap by transforming complex financial data into an interactive, visual, and AI-explained dashboard.

Whether you are a **student** looking for a 5-second plain-language summary, a **journalist** comparing year-over-year fiscal shifts, or a **citizen** wanting to simulate custom budget reallocations, Tx Expliner provides transparent, zero-latency insights.

---

## ✨ Key Features

### 📊 1. Interactive Budget Dashboard & Explorer
- **Instant Snapshot Metrics**: High-level budget totals, unit indicators, YoY growth trends, and sector weightings.
- **Searchable Sector Breakdown**: Filter, search, and drill into individual government spending categories.
- **Dynamic Recharts Visualizations**: Breakdown charts, comparison bar charts, and pie chart callout displays.

### 🤖 2. Grounded AI Explanations (SSE Token Streaming)
- **Plain-Language Insights**: Translates complex expenditure line items into clear real-world impact summaries.
- **Strict Grounding & Hallucination Guardrails**: Prompts generated strictly from validated budget objects.
- **7-Day Upstash Redis Caching**: Instant response delivery with zero API overhead on cached queries.
- **Rate-Limiting & Fallbacks**: Sliding window rate limits (20 req/hr authenticated, 5 req/hr guest) with automatic model fallback (`gemini-2.0-flash-lite` → `gemini-1.5-flash`).

### ⚖️ 3. Year-Over-Year & Country Comparison
- **Inflation-Adjusted Comparison Engine**: Compare budgets across years or jurisdictions with custom inflation rate adjustments (default 5%).
- **Categorical Delta Analysis**: Visual highlights for sector budget increases, decreases, new allocations, or discontinued items.
- **AI Comparative Summaries**: On-demand AI breakdown of fiscal policy shifts.

### 🎛️ 4. Budget Reallocation Simulator (Core Differentiator)
- **Zero-Sum Redistribution Engine**: Reallocate funds between sectors with real-time redistribution (<10ms execution).
- **Hamilton Largest-Remainder Precision**: Guarantees total sector percentage sum strictly equals 100.00% without floating-point drift.
- **Sector Locking**: Lock key sectors while adjusting remaining allocations proportionally.
- **60fps Throttled Visualization**: Throttled UI rendering via `requestAnimationFrame` for buttery-smooth slider interactions.
- **AI Policy Trade-off Analysis**: Stream real-time AI impact reports explaining the real-world policy trade-offs of custom reallocations.

### ⚡ 5. Background Cache Pre-Warming Engine
- **Server Startup Pre-Warming**: Next.js `instrumentation.ts` automatically runs background warming of default budget sector AI explanations on server initialization.
- **Zero-Latency User Experience**: Default sector clicks hit Redis cache instantly with 0 waiting time.

### 🔖 6. Bookmarks & User Profile
- **Persistent Bookmarks**: Save favorite budget sectors and comparison snapshots.
- **User Authentication**: Integrated Supabase auth and profile persistence.

### 🎨 7. "Phosphor Terminal Dark" Design System
- Modern, high-contrast visual theme (`#000000` void black background with `#7fee64` neon lime accent).
- Full accessibility compliance with keyboard focus rings (`:focus-visible`) and ARIA live regions for AI streaming outputs.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16.3.0 (App Router) | React Server Components, Turbopack, App Router API routes |
| **UI Library** | React 19.2.8 | Declarative client/server UI rendering |
| **Language** | TypeScript 5 | Strict static typing across models, API schemas, and components |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with custom design tokens and dark theme |
| **AI Providers** | `@google/genai`, `groq-sdk` | Gemini 2.0 Flash Lite & Groq Llama 3.3 70B models |
| **Cache & Rate Limit** | Upstash Redis REST Client | 7-day AI explanation cache & sliding-window rate limiting |
| **Auth & Storage** | Supabase JS v2 | Postgres DB, Auth providers, and user bookmarks |
| **Charts** | Recharts v3.10 | Responsive bar, pie, and comparison charts |
| **Testing** | Vitest v4.1.10, React Testing Library | 95 unit tests with Vitest v8 coverage runner |

---

## 📁 Directory Structure

```
tx-expliner/
├── app/                         # Next.js App Router Pages & API Routes
│   ├── page.tsx                 # Main Dashboard (/)
│   ├── budgets/page.tsx         # Sector Search & Detail Explorer (/budgets)
│   ├── compare/page.tsx         # YoY & Multi-Country Comparison (/compare)
│   ├── simulator/page.tsx       # Budget Reallocation Simulator (/simulator)
│   ├── bookmarks/page.tsx       # Saved Bookmarks (/bookmarks)
│   ├── profile/page.tsx         # User Profile (/profile)
│   ├── settings/page.tsx        # App Settings (/settings)
│   └── api/                     # REST & SSE Streaming API Endpoints
│       ├── ai/explain/route.ts  # POST: SSE AI explanation streaming
│       ├── chat/route.ts        # POST: SSE follow-up citizen Q&A
│       ├── compare/route.ts     # POST: Budget comparison calculation
│       ├── dashboard/route.ts   # GET: Dashboard dataset with Redis cache
│       ├── budgets/route.ts     # GET: Searchable sector datasets
│       ├── cache-warmup/route.ts# GET/POST: Pre-warming engine status & trigger
│       ├── bookmark/route.ts    # GET/POST/DELETE: User bookmarks
│       └── health/route.ts      # GET: System health & cache status
├── components/                  # React UI Components
│   ├── ai/                      # SSE streaming AI response & tradeoff cards
│   ├── budgets/                 # Search, disassembler, and visualizer charts
│   ├── dashboard/               # Hero cards, sector list, and overview stat cards
│   ├── nav/                     # Navbar, Sidebar, and Mobile navigation drawer
│   ├── providers/               # Supabase Auth & Bookmark state providers
│   ├── simulator/               # Sector sliders, 60fps chart, and lock controls
│   └── ui/                      # Toasts, theme selectors, and shared UI
├── lib/                         # Core Libraries & Utilities
│   ├── budget/                  # Dataset service & schema sanitization
│   ├── cache/                   # Background AI cache pre-warming engine
│   ├── gemini/                  # Grounded prompt builders & Gemini client
│   ├── redis/                   # Upstash Redis client & rate limiter
│   └── utils/                   # Zero-sum simulator math & Hamilton rounding
├── types/                       # TypeScript Interface Definitions
│   └── budget.ts                # SectorBudget, BudgetDataset, SimulationState, etc.
├── instrumentation.ts           # Next.js server startup hook for cache warming
└── vitest.config.ts             # Vitest test suite configuration
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/ritam413/Tax-Expliner.git
cd Tax-Expliner
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory (do **NOT** commit this file):

```env
# Google Gemini AI Key
GEMINI_API_KEY=your_gemini_api_key_here

# Groq AI Key (Optional fallback)
GROQ_API_KEY=your_groq_api_key_here

# Upstash Redis (Caching & Rate Limiting)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Cache Pre-Warming Secret (Production protection)
WARMUP_SECRET=your_custom_warmup_secret_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to explore the dashboard.

---

## 🧪 Testing & Verification

Tx Expliner is backed by a comprehensive suite of **95 unit tests** covering mathematical redistribution algorithms, rounding precision, Gemini prompt generation, and Zod schema validation.

```bash
# Run unit tests synchronously
npm run test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Run TypeScript type check
npx tsc --noEmit

# Test production build locally
npm run build
```

### Test Coverage Highlights
- 🎛️ **Simulator Engine (26 tests)**: Zero-sum redistribution, extreme dragging (0% / 100%), sector locking, floor guards, and Hamilton largest-remainder 100.00% percentage rounding.
- 🤖 **Gemini AI Client (32 tests)**: Prompt builders, custom prompt overrides, and client initialization null guards.
- 📋 **Budget Service (37 tests)**: Zod schema validation, data sanitization (NaN / zero-division guards), and YoY inflation-adjusted comparisons.

---

## 🔌 API Reference

| Endpoint | Method | Type | Description |
|---|---|---|---|
| `/api/dashboard` | `GET` | REST | Fetches dashboard dataset with 24h Redis caching |
| `/api/budgets` | `GET` | REST | Search & filter budget sector datasets |
| `/api/compare` | `POST` | REST | Compares 2 budget datasets with inflation adjustments |
| `/api/ai/explain` | `POST` | SSE Stream | Streams plain-language AI explanation for sector or tradeoff |
| `/api/chat` | `POST` | SSE Stream | Multi-turn AI follow-up chat for citizen Q&A |
| `/api/cache-warmup` | `GET/POST` | REST | Check cache status or trigger background pre-warming |
| `/api/bookmark` | `GET/POST/DELETE` | REST | Manage user saved sector & comparison bookmarks |
| `/api/health` | `GET` | REST | System health check (Supabase, Gemini, Redis, Cache status) |

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for Citizen Transparency & Open Data Visualization.
</p>
