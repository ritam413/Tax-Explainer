# 📋 Feature Design Document

## 1. Feature Name
Bookmarks

## 2. Problem Statement
Users find interesting budget items or comparisons but have no way to save them for later without re-searching from scratch.

## 3. User Story
As a returning user,
I want to bookmark a budget item or comparison
so that I can quickly find it again without re-searching.

## 4. Success Criteria
- ✓ User can bookmark any budget item or comparison with one tap
- ✓ Bookmark list loads in <1 second
- ✓ Bookmarks persist across sessions/devices
- ✓ User can remove a bookmark easily
- ✓ Bookmarks show on Dashboard as a shortcut

## 5. Screen(s)
```
Budget Detail / Comparison Result
  ↓
Bookmark Button (toggle)
  ↓
Bookmarks List (dedicated page or Dashboard section)
```

## 6. Navigation Flow
```
User views budget/comparison
  ↓
Taps Bookmark icon
  ↓
Toast confirmation ("Saved to Bookmarks")
  ↓
Dashboard → Bookmarks section → View saved item
```

## 7. UI Components
- Bookmark Icon Button (toggle: filled/outline)
- Bookmarks List Card
- Empty state illustration
- Remove/unbookmark action (swipe or button)
- Toast

## 8. Data Required
- User ID
- Budget ID (or Comparison ID)
- Timestamp saved

## 9. Data Source
| Data | Source |
|---|---|
| Bookmark records | Supabase (`bookmarks` table) |
| Budget details | Supabase (`budgets` table, joined) |

## 10. Database Tables
- `bookmarks` (id, user_id, budget_id)
- `budgets`
- `users`

## 11. API Endpoints
- `GET /bookmark`
- `POST /bookmark`
- `DELETE /bookmark`

## 12. Business Logic
```
User taps bookmark icon
  ↓
Check if already bookmarked
  ↓
Not bookmarked → POST /bookmark → insert row
  ↓
Already bookmarked → DELETE /bookmark → remove row
  ↓
Update icon state optimistically
  ↓
Confirm via toast
```

## 13. Validation Rules
- User must be logged in to bookmark (guest sees login prompt)
- Cannot duplicate bookmark for same budget_id + user_id
- Budget/comparison being bookmarked must exist

## 14. States
**Loading**
- Icon shows subtle loading pulse while request is in flight

**Empty**
- "No bookmarks yet — save budgets you want to revisit" + CTA to Search

**Success**
- Bookmark icon filled, toast confirmation, item appears in list

**Error**
- Save failed → revert optimistic UI + toast "Couldn't save bookmark, try again"

## 15. Permissions
| Role | Access |
|---|---|
| Guest | Prompted to log in when attempting to bookmark |
| Logged User | Full bookmark CRUD |
| Admin | Same as user |

## 16. Edge Cases
- User bookmarks the same item twice quickly (double-tap)
- Bookmarked budget later removed/updated by admin (show "data updated" note)
- User has hundreds of bookmarks (needs pagination/search within bookmarks)
- Offline bookmark attempt
- Bookmark synced across two devices simultaneously

## 17. Performance
- Optimistic UI update on bookmark toggle
- Paginate bookmark list beyond 20 items
- Cache bookmark list briefly (short TTL, invalidate on write)

## 18. Security
- Row Level Security: users can only read/write their own bookmarks
- Rate limit bookmark writes (prevent spam)

## 19. Accessibility
- Bookmark button has ARIA label ("Add to bookmarks" / "Remove from bookmarks")
- Keyboard accessible (Enter/Space toggles)
- Bookmark list navigable via keyboard with clear focus states

## 20. Analytics
- Bookmark Added
- Bookmark Removed
- Bookmarks List Viewed
- Bookmark Clicked (navigated to detail)

## 21. Testing Checklist
**Unit Tests**
- Toggle logic (add vs remove)
- Duplicate prevention

**API Tests**
- POST /bookmark (valid, duplicate, unauthenticated)
- DELETE /bookmark (valid, non-existent)
- GET /bookmark (empty, populated, paginated)
