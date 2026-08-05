# 📋 Feature Design Document

## 1. Feature Name
Budget Search

## 2. Problem Statement
Government budget PDFs are huge and unsearchable in practice. Users need a fast way to find a specific sector, department, or year without digging through raw documents.

## 3. User Story
As a college student,
I want to search for a specific budget category (e.g. "Education")
so that I can instantly see how much was allocated without reading a PDF.

## 4. Success Criteria
- ✓ Search returns results in <1 second
- ✓ Supports partial/fuzzy matches on department/category names
- ✓ Filter by country and year
- ✓ Results link directly into Charts and AI Explain
- ✓ Empty/no-match state is clear, not a blank screen

## 5. Screen(s)
```
Dashboard
  ↓
Search
  ↓
Results List
  ↓
Budget Detail (Charts / AI Explain)
```

## 6. Navigation Flow
```
Dashboard
  ↓
Click Search
  ↓
Type query / apply filters (country, year, category)
  ↓
Results render
  ↓
Select result → Budget Detail
```

## 7. UI Components
- Search Input (with debounce)
- Country Dropdown
- Year Dropdown
- Category Filter chips
- Result Card list
- Empty state illustration
- Pagination
- Loading skeleton

## 8. Data Required
- Country
- Budget Year
- Department/Category
- Allocated Amount
- Category tags (array)

## 9. Data Source
| Data | Source |
|---|---|
| Budget records | Supabase (`budgets` table) |
| Cached common queries | Redis |

## 10. Database Tables
- `budgets` (id, country, year, category[], amount[])

## 11. API Endpoints
- `GET /budgets?query=&country=&year=&category=`
- `GET /budgets/:id`

## 12. Business Logic
```
User types query
  ↓
Debounce 300ms
  ↓
Check Redis for cached query result
  ↓
Cache hit → return
  ↓
Cache miss → query Supabase (ILIKE / full-text search)
  ↓
Cache result in Redis (TTL: 1h)
  ↓
Render result list
```

## 13. Validation Rules
- Query must be at least 2 characters to trigger search
- Country + year filters must reference existing datasets
- Max 50 results per page (paginated)

## 14. States
**Loading**
- Skeleton result cards

**Empty**
- "No matching budgets found" + suggestion to broaden filters

**Success**
- Ranked result list with amount + category tag

**Error**
- Search service failure → toast + retry
- Timeout → "Taking longer than usual" message with cancel option

## 15. Permissions
| Role | Access |
|---|---|
| Guest | Full search access |
| Logged User | Search + can bookmark results directly |
| Admin | Search + edit/upload dataset shortcut |

## 16. Edge Cases
- Query matches zero results
- Query matches too many results (needs pagination)
- Ambiguous category names across countries
- Special characters in search query
- Simultaneous filter + text query conflicts
- Dataset not yet available for selected year

## 17. Performance
- Debounce input (300ms)
- Cache popular queries in Redis
- Paginate/lazy-load results
- Index `category` and `country` columns in Postgres

## 18. Security
- Sanitize search input (prevent SQL injection via parameterized queries)
- Rate limit search API (avoid scraping abuse)
- No PII in search logs

## 19. Accessibility
- Search input has visible label + placeholder
- Results announced via ARIA live region as they load
- Keyboard-navigable filter chips
- Focus returns to input after clearing filters

## 20. Analytics
- Search Performed (query, filters, result count)
- Zero Result Search
- Result Clicked
- Filter Applied

## 21. Testing Checklist
**Unit Tests**
- Query debounce logic
- Filter combination logic

**API Tests**
- GET /budgets with query only
- GET /budgets with query + filters
- GET /budgets with no matches
- GET /budgets/:id (valid/invalid)
