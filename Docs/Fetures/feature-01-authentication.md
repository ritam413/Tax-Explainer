# 📋 Feature Design Document

## 1. Feature Name
Authentication (Login / Signup / Forgot Password)

## 2. Problem Statement
Users need a simple, low-friction way to create an account and log back in so their bookmarks, chat history, and preferences persist across sessions.

## 3. User Story
As a college student,
I want to sign up or log in quickly with minimal steps
so that I can start exploring budgets without friction and my saved data is remembered next time.

## 4. Success Criteria
- ✓ User can sign up with email + password in <30 seconds
- ✓ User can log in and land on Dashboard in <2 seconds
- ✓ Forgot password flow sends a working reset link
- ✓ Session persists across browser refresh
- ✓ Invalid credentials show a clear inline error (no crash)

## 5. Screen(s)
```
Landing
  ↓
Login / Signup (single page, tabbed)
  ↓
Forgot Password
  ↓
Dashboard
```

## 6. Navigation Flow
```
Landing
  ↓
Click "Get Started"
  ↓
Login / Signup Tab
  ↓
Submit Form
  ↓
Validate
  ↓
Success → Dashboard
Failure → Inline Error
```

## 7. UI Components
- Navbar
- Auth Card (tabbed: Login / Signup)
- Input (email, password, name)
- Button (primary, loading state)
- Toast (error / success)
- Forgot Password Link
- Divider ("or continue with")

## 8. Data Required
- Name
- Email
- Password (hashed, never stored plain)
- PAN (optional, for tax-relevant personalization)
- Country
- Profession (optional)

## 9. Data Source
| Data | Source |
|---|---|
| User credentials | Supabase Auth |
| User profile | Supabase Postgres (`users` table) |
| Session token | Supabase Auth (JWT) |

## 10. Database Tables
- `users` (id, name, email, pan, country, prof)

## 11. API Endpoints
- `POST /signup`
- `POST /login`
- `PATCH /forgot-password`

## 12. Business Logic
```
User submits form
  ↓
Validate email format + password strength
  ↓
Check if email already exists (signup)
  ↓
Create/authenticate via Supabase Auth
  ↓
Create row in `users` table (signup only)
  ↓
Issue session token
  ↓
Redirect to Dashboard
```

## 13. Validation Rules
- Email must be valid format
- Password minimum 8 characters
- Email must be unique on signup
- Reset link expires after 15 minutes

## 14. States
**Loading**
- Button spinner, form disabled

**Empty**
- Fresh form, no prefill

**Success**
- Redirect to Dashboard, welcome toast

**Error**
- Invalid credentials → inline field error
- Email already exists → inline error with "Log in instead?" link
- Network failure → toast with Retry

## 15. Permissions
| Role | Access |
|---|---|
| Guest | Can view Login/Signup only |
| Logged User | Full access post-auth |

## 16. Edge Cases
- Duplicate signup attempt
- Expired reset link
- Password reset requested but email doesn't exist (don't leak existence — generic message)
- User closes tab mid-signup
- Supabase Auth service down
- Autofill/browser password manager conflicts

## 17. Performance
- Auth check should resolve in <500ms
- Debounce email-exists check
- Prefetch Dashboard shell while auth resolves

## 18. Security
- Passwords hashed via Supabase Auth (bcrypt)
- Rate limit login attempts (5/min per IP)
- CSRF protection on forms
- No sensitive data (PAN) exposed in client-side logs
- HTTPS only, secure cookies for session

## 19. Accessibility
- Keyboard-navigable form (Tab order: email → password → submit)
- ARIA labels on all inputs
- Error messages announced to screen readers
- Sufficient color contrast on error states
- Visible focus rings

## 20. Analytics
- Signup Started
- Signup Completed
- Login Success
- Login Failed
- Password Reset Requested

## 21. Testing Checklist
**Unit Tests**
- Email validation
- Password strength check

**API Tests**
- POST /signup (valid, duplicate, invalid)
- POST /login (valid, invalid, rate-limited)
- PATCH /forgot-password (valid, unknown email, expired token)
