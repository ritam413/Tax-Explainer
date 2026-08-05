# 📋 Feature Design Document

## 1. Feature Name
Dashboard (Budget Overview)

## 2. Problem Statement
Users land with no context after login — they need an immediate, digestible snapshot of government budget data without having to know what to search for first.

## 3. User Story
As a college student,
I want to see a quick overview of the current budget the moment I log in
so that I get a "dopamine hit" of insight within 5 seconds, without needing to research first.

## 4. Success Criteria
- ✓ Dashboard loads in <2 seconds
- ✓ Shows a default/highlighted budget snapshot on first load
- ✓ User can jump to Search, Compare, or AI Explain from here
- ✓ Shows user's bookmarks and recent activity
- ✓ Fully responsive on mobile

## 5. Screen(s)
```
Login
  ↓
Dashboard
  ├── Budget Overview (default country/year)
  ├── Search entry point
  ├── Bookmarks shortcut
  └── Recent AI Explanations
```

## 6. Navigation Flow
```
Dashboard
  ↓
Select Sector / "Everything"
  ↓
Budget Overview updates
  ↓
User can → Search / Compare / AI Explain / Bookmark
```

## 7. UI Components
- Navbar
- Sidebar
- Page Header
- Sector Selector (chips/dropdown)
- Summary Card (top-line numbers)
- Chart Card (Lottie-based)
- Bookmark shortcut list
- AI Explain teaser card
- Loading skeleton

## 8. Data Required
- Country
- Budget Year
- Department/Category breakdown
- Allocated Amount
- Top 3–5 sectors by spend
- User's bookmarked items (if logged in)

## 9. Data Source
| Data | Source |
|---|---|
| Budget snapshot | Supabase |
| Bookmarks | Supabase |
| Cached snapshot | Redis |

## 10. Database Tables
- `budgets`
- `bookmarks`
- `users`

## 11. API Endpoints
- `GET /budgets` (default/latest)
- `GET /bookmarks`
- `GET /budgets/:id`

## 12. Business Logic
```
User lands on Dashboard
  ↓
Check Redis cache for default budget snapshot
  ↓
Found? → Return cached
  ↓
Not found? → Fetch from Supabase → Cache in Redis
  ↓
Render summary cards + charts
  ↓
Fetch user's bookmarks in parallel
```

## 13. Validation Rules
- Default country/year must always resolve to a valid dataset
- Fallback to most recent available year if current year data missing

## 14. States
**Loading**
- Skeleton cards for summary + charts

**Empty**
- "No budget data available yet" + retry button (rare — only if backend fails)

**Success**
- Summary cards, charts, bookmarks, recent activity all populated

**Error**
- Failed to fetch → toast + retry button
- Redis down → fall back to direct DB fetch silently

## 15. Permissions
| Role | Access |
|---|---|
| Guest | View-only, generic default data |
| Logged User | Personalized dashboard with bookmarks/history |
| Admin | Same as user + data management shortcut |

## 16. Edge Cases
- No internet on load
- User has zero bookmarks (show empty state, not blank)
- Budget data missing for selected sector
- Redis cache stale/inconsistent with DB
- Extremely large dataset slows initial paint

## 17. Performance
- Cache default snapshot in Redis (TTL: 24h)
- Lazy-load charts below the fold
- Skeleton-first render, no blocking spinner
- Memoize sector selector re-renders

## 18. Security
- Row Level Security on `bookmarks` (user can only see their own)
- Rate limit dashboard API calls
- Sanitize any user-set default preferences

## 19. Accessibility
- Keyboard navigation across sector chips
- ARIA labels on chart regions (with text alternative summary)
- Color contrast compliant chart palette
- Screen-reader-friendly summary text alongside visual charts

## 20. Analytics
- Dashboard Viewed
- Sector Selected
- Bookmark Clicked from Dashboard
- AI Explain Teaser Clicked

## 21. Testing Checklist
**Unit Tests**
- Default sector resolution logic
- Cache-hit vs cache-miss branching

**API Tests**
- GET /budgets (default)
- GET /bookmarks (authenticated)
- GET /budgets/:id (valid/invalid id)
