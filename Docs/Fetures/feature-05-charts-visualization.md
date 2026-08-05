# 📋 Feature Design Document

## 1. Feature Name
Charts & Visualization

## 2. Problem Statement
Numbers alone don't communicate scale or proportion well — users need visual charts to grasp how budget money is distributed at a glance.

## 3. User Story
As a college student,
I want to see a budget category as a chart (pie/bar)
so that I can instantly grasp proportion and scale without reading numbers.

## 4. Success Criteria
- ✓ Chart renders within 1 second of data being available
- ✓ Chart types adapt to data shape (pie for proportion, bar for comparison)
- ✓ Charts are interactive (hover/tap for exact figures)
- ✓ Charts remain readable on mobile
- ✓ Charts have accessible text alternatives

## 5. Screen(s)
```
Budget Detail / Search Result / Comparison / Dashboard
  ↓
Chart Card (embedded)
  ↓
Expanded Chart View (optional full-screen/modal)
```

## 6. Navigation Flow
```
Data loads for a budget/category
  ↓
Chart Card renders (Lottie/animated in)
  ↓
User hovers/taps → tooltip with exact value
  ↓
User can expand chart to full view
```

## 7. UI Components
- Chart Card (pie, bar, line variants)
- Legend
- Tooltip
- Chart Type Toggle (pie ↔ bar)
- Expand/Modal trigger
- Loader (Lottie animation)
- Export chart as image button

## 8. Data Required
- Category
- Allocated Amount
- Previous Year Amount (for trend charts)
- Growth %
- Currency

## 9. Data Source
| Data | Source |
|---|---|
| Budget data | Supabase |
| Cached aggregates | Redis |

## 10. Database Tables
- `budgets`
- `budget_categories`

## 11. API Endpoints
- `GET /budgets/:id`
- `GET /budgets` (aggregated for chart rendering)

## 12. Business Logic
```
Budget data loads
  ↓
Transform raw data into chart-ready format (labels, values, colors)
  ↓
Check Redis for cached aggregate (if large dataset)
  ↓
Render chart with animation
  ↓
On hover/tap → show exact value + % of total
```

## 13. Validation Rules
- Chart must have at least 2 data points to render (else show "not enough data")
- Values must be non-negative
- Percentages must sum to ~100% (validate on data prep)

## 14. States
**Loading**
- Lottie loading animation

**Empty**
- "Not enough data to visualize" message

**Success**
- Interactive chart with legend + tooltip

**Error**
- Malformed data → fallback to table view
- Render failure → "Chart couldn't load" + raw data table fallback

## 15. Permissions
| Role | Access |
|---|---|
| Guest | View charts |
| Logged User | View + export charts |
| Admin | View + export + edit underlying data |

## 16. Edge Cases
- Extremely small or extremely large values skewing chart scale
- Too many categories (chart becomes unreadable) → group into "Other"
- Negative growth values
- Missing previous year data for trend chart
- Currency mismatch across countries in same view

## 17. Performance
- Memoize chart data transformation
- Cache aggregated chart data in Redis
- Use canvas/SVG rendering optimized for large datasets
- Lazy-load charts not in viewport

## 18. Security
- No user-editable data reaches chart render without validation (prevent injection via labels)
- Rate limit export endpoint

## 19. Accessibility
- Text-alternative summary table alongside every chart
- ARIA labels describing chart type and key values
- Color palette colorblind-safe
- Keyboard-navigable legend toggles

## 20. Analytics
- Chart Viewed
- Chart Type Toggled
- Chart Expanded
- Chart Exported

## 21. Testing Checklist
**Unit Tests**
- Data transformation (raw → chart format)
- "Other" grouping logic for long-tail categories

**API Tests**
- GET /budgets/:id (chart-ready response)
- GET /budgets (aggregated multi-category)
