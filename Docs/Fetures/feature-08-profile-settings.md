# 📋 Feature Design Document

## 1. Feature Name
Profile & Settings

## 2. Problem Statement
Users need a place to manage their account details and personalize their experience (e.g. dark mode) without it interrupting their main exploration flow.

## 3. User Story
As a returning user,
I want to view/edit my profile and toggle preferences like dark mode
so that the app feels personalized and my account info stays accurate.

## 4. Success Criteria
- ✓ User can view and edit name, country, profession
- ✓ Dark mode toggle applies instantly and persists across sessions
- ✓ Settings changes save without a page reload
- ✓ Profile shows bookmark/comparison history count
- ✓ Logout works reliably from Profile

## 5. Screen(s)
```
Dashboard
  ↓
Profile
  ↓
Settings
  ↓
(Logout)
```

## 6. Navigation Flow
```
Navbar → Avatar
  ↓
Profile Page (view/edit info)
  ↓
Settings Tab (dark mode, notifications, data prefs)
  ↓
Save → Toast confirmation
```

## 7. UI Components
- Avatar
- Profile Card (editable fields)
- Input fields (name, country, profession)
- Dark Mode Toggle
- Tabs (Profile / Settings)
- Save Button
- Logout Button
- Toast

## 8. Data Required
- Name
- Email (read-only)
- Country
- Profession
- Theme preference (light/dark)
- Notification preference (if applicable)

## 9. Data Source
| Data | Source |
|---|---|
| Profile info | Supabase (`users` table) |
| Theme preference | Supabase (`users` table) or local state + synced |

## 10. Database Tables
- `users` (id, name, email, pan, country, prof, theme_preference)

## 11. API Endpoints
- `GET /profile`
- `PATCH /profile`

## 12. Business Logic
```
User opens Profile
  ↓
GET /profile → populate form
  ↓
User edits field / toggles dark mode
  ↓
PATCH /profile (debounced or on explicit Save)
  ↓
Update local theme state immediately (optimistic)
  ↓
Confirm via toast
```

## 13. Validation Rules
- Name cannot be empty
- Country must be from supported list
- Email is not editable (managed via Auth)

## 14. States
**Loading**
- Skeleton form fields

**Empty**
- N/A (profile always has at least default values)

**Success**
- Updated fields reflected immediately, toast "Profile updated"

**Error**
- Save failed → toast "Couldn't save changes, try again" + revert optimistic UI

## 15. Permissions
| Role | Access |
|---|---|
| Guest | No access (redirected to login) |
| Logged User | Edit own profile/settings only |
| Admin | Edit own profile + access Admin panel link |

## 16. Edge Cases
- User changes country mid-session (affects default budget context elsewhere)
- Dark mode toggle during active chart render (avoid visual flash)
- Concurrent edits from two devices
- Network failure mid-save
- User logs out with unsaved changes

## 17. Performance
- Debounce PATCH calls on field edits
- Apply theme change client-side instantly, sync to DB async
- Cache profile data briefly to avoid refetch on every visit

## 18. Security
- Row Level Security: users can only edit their own profile
- Email/PAN changes (if ever allowed) require re-verification
- Rate limit PATCH /profile

## 19. Accessibility
- Dark mode toggle has ARIA label and reflects state (aria-pressed)
- Form fields properly labeled
- Sufficient contrast in both light and dark themes
- Focus retained on active field after save

## 20. Analytics
- Profile Viewed
- Profile Updated
- Dark Mode Toggled
- Logout Clicked

## 21. Testing Checklist
**Unit Tests**
- Field validation logic
- Theme persistence logic

**API Tests**
- GET /profile
- PATCH /profile (valid, invalid, unauthenticated)
