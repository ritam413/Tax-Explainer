# API Design

Base pattern: REST over Next.js API Routes / Server Actions, backed by Supabase.

## Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Create account |
| POST | `/login` | Authenticate, issue session |
| PATCH | `/forgot-password` | Trigger password reset |

## Budgets
| Method | Endpoint | Description |
|---|---|---|
| GET | `/budgets` | List/search budgets (query, country, year, category filters) |
| GET | `/budgets/:id` | Get single budget detail |

## Comparison
| Method | Endpoint | Description |
|---|---|---|
| POST | `/compare` | Compare two budgets (years/countries), returns diff + triggers AI summary |

## AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/explain` | Get AI explanation for a budget item, comparison, or simulation delta |
| POST | `/chat` | Follow-up question within an AI Explain context |

## Bookmarks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/bookmark` | List current user's bookmarks |
| POST | `/bookmark` | Add a bookmark |
| DELETE | `/bookmark` | Remove a bookmark |

## Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/profile` | Get current user's profile |
| PATCH | `/profile` | Update profile fields / theme preference |

## Feedback
| Method | Endpoint | Description |
|---|---|---|
| POST | `/feedback` | Submit feedback (category, message, context) |

## Simulator (client-heavy — minimal API surface)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/budgets/:id` | Reused — baseline data for simulation |
| POST | `/ai/explain` | Reused — explain a simulated tradeoff (on demand only) |

## Request/Response Conventions
- All list endpoints support pagination: `?page=1&limit=20`
- All endpoints return errors as: `{ "error": { "code": string, "message": string } }`
- Authenticated endpoints require a valid Supabase session (via cookie or Authorization header)
- AI endpoints (`/ai/explain`, `/chat`) are streamed (Server-Sent Events or streaming response) where the client supports it

## Rate Limiting
| Endpoint | Limit |
|---|---|
| `/login` | 5/min per IP |
| `/ai/explain`, `/chat` | 20/hour per user (guest: 5/hour) |
| `/feedback` | 5/min per IP |
| `/bookmark` (POST) | 30/min per user |

## Caching (Redis)
| Data | Cache Key Pattern | TTL |
|---|---|---|
| Budget search results | `search:{query}:{filters}` | 1 hour |
| Default dashboard snapshot | `dashboard:{country}:{year}` | 24 hours |
| AI explanation | `ai_explain:{budget_id}:{version}` | 7 days |
| Comparison AI summary | `compare:{budget_id_a}:{budget_id_b}` | 7 days |
