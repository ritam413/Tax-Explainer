# Architecture & Deployment

## 1. Stack Overview
| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 15 (App Router) + React + Tailwind | SEO, Server Components, easy deployment |
| Backend | Supabase | Auth, Postgres, Row Level Security, Edge Functions if needed |
| Database | Supabase Postgres | Managed Postgres with dashboard |
| Authentication | Supabase Auth | Email login (Google/GitHub optional later) |
| AI | Gemini API | Budget explanations, comparison summaries, simulator tradeoffs |
| Cache | Upstash Redis | Cache AI responses and frequently accessed budget data |
| Storage | Supabase Storage | PDFs, CSVs, icons, datasets |
| Deployment | Vercel | Best integration with Next.js |

## 2. High-Level Architecture
```
                    Browser
                       │
                       ▼
              Next.js Frontend (Vercel)
        (App Router + React + Tailwind)
                       │
           Server Actions / API Routes
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
      Supabase                 Gemini API
 (Postgres + Auth + Storage)      (AI)
          │
          ▼
       Upstash Redis
         (Cache)
```

## 3. Request Flow (example: AI Explain)
```
User searches "Education Budget"
  ↓
Next.js Server Action
  ↓
Check Redis Cache
  ↓
Found? ── Yes ──► Return cached response
  │
  No
  ↓
Read structured data from Supabase
  ↓
Send structured data to Gemini
  ↓
Gemini generates explanation
  ↓
Save explanation in Redis
  ↓
Return result to user
```

## 4. Environments
| Environment | Purpose | URL pattern |
|---|---|---|
| Local | Development | `localhost:3000` |
| Preview | Per-PR preview (Vercel auto-deploy) | `*.vercel.app` |
| Staging | Pre-production QA, E2E test target | `staging.<domain>` |
| Production | Live app | `<domain>` |

## 5. Environment Variables (indicative)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only
GEMINI_API_KEY=                  # server-only
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## 6. Deployment Process
1. Push to feature branch → Vercel Preview deploy auto-generated
2. PR review + CI (unit/API tests from `11-testing.md`) must pass
3. Merge to `main` → auto-deploy to Staging
4. Run Playwright E2E suite against Staging
5. Promote Staging build to Production (manual approval gate)

## 7. Monitoring & Observability
- Vercel Analytics / Web Vitals for frontend performance
- Supabase dashboard for DB health/query performance
- Redis hit/miss ratio tracked (target >70% cache hit rate on AI Explain after warm-up)
- Error tracking (e.g. Sentry) wired into API routes and client error boundaries

## 8. Scaling Considerations
- Redis caching is the primary lever to control Gemini API cost as usage grows
- Supabase read replicas if `budgets`/`budget_categories` read volume grows significantly
- Consider moving heavy AI prompt construction to an Edge Function if latency becomes an issue

## 9. Security Baseline (applies platform-wide)
- Row Level Security enforced on all user-scoped tables (see `05-database-schema.md`)
- Rate limiting on auth, AI, and feedback endpoints (see `06-api-design.md`)
- Secrets (Gemini key, Supabase service role key) never exposed client-side
- HTTPS enforced everywhere; secure, httpOnly session cookies
