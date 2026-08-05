# 📋 Feature Design Document

## 1. Feature Name
Budget Comparison

## 2. Problem Statement
Users want to compare government spending between two years (or countries) without manually reading large budget PDFs.

## 3. User Story
As a student,
I want to compare India's Education Budget for 2024 and 2025
so that I can understand how spending changed.

## 4. Success Criteria
- ✓ User can select two years (or two countries)
- ✓ Comparison loads in <2 seconds
- ✓ AI generates a summary of the comparison
- ✓ Charts update correctly to reflect both datasets
- ✓ User can share the comparison

## 5. Screen(s)
```
Dashboard
  ↓
Compare Page
  ↓
Comparison Result
  ↓
Share Dialog
```

## 6. Navigation Flow
```
Dashboard
  ↓
Compare
  ↓
Select Years (or Countries)
  ↓
Generate Comparison
  ↓
View Charts
  ↓
Ask AI
  ↓
Export PDF
```

## 7. UI Components
- Navbar
- Sidebar
- Page Header
- Country Selector
- Year Dropdown
- Compare Button
- Loading Spinner
- Chart Card
- AI Response Card
- Export Button
- Share Button
- Toast
- Modal

## 8. Data Required
- Country
- Budget Year
- Department
- Category
- Allocated Amount
- Previous Year Amount
- Growth %
- Inflation Adjusted Value
- Currency

## 9. Data Source
| Data | Source |
|---|---|
| Budget Data | Supabase |
| AI Summary | Gemini |
| User | Supabase Auth |
| Cached Results | Redis |

## 10. Database Tables
- `users`
- `budgets`
- `budget_categories`
- `comparisons`
- `ai_history`
- `bookmarks`

## 11. API Endpoints
- `GET /api/budgets`
- `GET /api/budgets/:id`
- `POST /api/compare`
- `POST /api/ai/explain`
- `POST /api/bookmark`

## 12. Business Logic
```
User selects years
  ↓
Validate inputs
  ↓
Check Redis cache
  ↓
If cache exists → return cached result
  ↓
Else:
  Fetch budget data
    ↓
  Compare values
    ↓
  Send structured data to Gemini
    ↓
  Receive explanation
    ↓
  Store in Redis
    ↓
  Return response
```

## 13. Validation Rules
- Country required
- Year required
- Cannot compare same year against itself
- Budget must exist for both selections
- Maximum 2 comparisons at a time

## 14. States
**Loading**
- Skeleton Cards
- Spinner
- Disable Buttons

**Empty**
- "No comparison available."
- Show Compare Button

**Success**
- Charts
- Summary
- Growth %
- Export

**Error**
- Failed to fetch data → Retry Button
- No Internet → Offline / Retry
- AI Failure → Show chart, hide AI summary, Retry AI

## 15. Permissions
| Role | Access |
|---|---|
| Guest | View only |
| Logged User | Compare, Bookmark, History |
| Admin | Upload datasets, Manage budgets |

## 16. Edge Cases
- No budget data
- Invalid year
- Server timeout
- Gemini unavailable
- Redis down
- Database unavailable
- Large dataset
- Duplicate comparison
- Network disconnect
- User logs out mid-comparison

## 17. Performance
- Cache AI response
- Pagination
- Lazy Loading
- Image Optimization
- Memoization
- Streaming AI response

## 18. Security
- Authentication
- Authorization
- Rate Limiting
- Input Validation
- SQL Injection Protection
- XSS Protection
- CSRF Protection

## 19. Accessibility
- Keyboard Navigation
- ARIA Labels
- Color Contrast
- Screen Reader Support
- Focus States
- Alt Text

## 20. Analytics
- Comparison Created
- AI Used
- Budget Viewed
- Export PDF
- Bookmark Added
- Share Clicked

## 21. Testing Checklist
**Unit Tests**
- Compare Function
- Growth Calculation
- Percentage Logic

**API Tests**
- GET /budgets
- POST /compare
- POST /ai/explain
