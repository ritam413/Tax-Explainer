# 📋 Feature Design Document

## 1. Feature Name
Feedback

## 2. Problem Statement
The team has no lightweight channel to hear from users about bugs, confusing explanations, or missing features, which slows down prioritization.

## 3. User Story
As a user,
I want to quickly send feedback about something confusing or broken
so that the team can improve the app without me needing to leave a review or find support email.

## 4. Success Criteria
- ✓ Feedback form accessible from anywhere in <2 taps
- ✓ Submission takes <10 seconds
- ✓ User gets confirmation the feedback was received
- ✓ Feedback is categorized (bug / suggestion / confusing) for easy triage
- ✓ No login required to submit feedback

## 5. Screen(s)
```
Any screen (Navbar/Sidebar entry point)
  ↓
Feedback Modal
  ↓
Confirmation Toast
```

## 6. Navigation Flow
```
User clicks "Feedback" (Navbar/Sidebar)
  ↓
Modal opens
  ↓
Select category + type message
  ↓
Submit
  ↓
Toast confirmation → Modal closes
```

## 7. UI Components
- Feedback Trigger Button (Navbar/Sidebar)
- Modal
- Category Selector (Bug / Suggestion / Confusing / Other)
- Textarea Input
- Submit Button
- Toast

## 8. Data Required
- User ID (optional, if logged in)
- Category
- Message text
- Page/context (auto-captured, e.g. current URL or feature name)
- Timestamp

## 9. Data Source
| Data | Source |
|---|---|
| Feedback submissions | Supabase (`feedback` table) |
| User context | Supabase Auth (if logged in) |

## 10. Database Tables
- `feedback` (id, user_id [nullable], category, message, context, created_at)

## 11. API Endpoints
- `POST /feedback`

## 12. Business Logic
```
User opens feedback modal
  ↓
Auto-capture current page/feature context
  ↓
User selects category + writes message
  ↓
Submit → POST /feedback
  ↓
Insert row (user_id null if guest)
  ↓
Show confirmation toast
  ↓
Close modal
```

## 13. Validation Rules
- Message cannot be empty
- Message max length (e.g. 1000 characters)
- Category required
- Basic spam check (rate limit per IP/user)

## 14. States
**Loading**
- Submit button shows spinner, disabled

**Empty**
- Fresh modal, category unselected, textarea empty

**Success**
- Toast "Thanks! Feedback received" + modal closes

**Error**
- Submission failed → inline error "Couldn't send, try again" (keep modal open, preserve input)

## 15. Permissions
| Role | Access |
|---|---|
| Guest | Can submit feedback (anonymous) |
| Logged User | Can submit feedback (linked to account) |
| Admin | Can view/triage all feedback (separate admin view) |

## 16. Edge Cases
- User submits empty/whitespace-only message
- User spams multiple submissions in a row
- Very long message (needs truncation/limit)
- Feedback submitted offline (queue and retry, or fail gracefully)
- Context capture fails (still allow submission without it)

## 17. Performance
- Feedback modal should load instantly (lightweight, no heavy data fetch)
- Submission should not block UI — optimistic close with background retry on failure

## 18. Security
- Rate limit feedback submissions (prevent spam/abuse)
- Sanitize message input (prevent XSS if displayed in admin panel)
- No sensitive data auto-captured beyond page context

## 19. Accessibility
- Modal is keyboard-dismissible (Esc key)
- Focus trapped within modal while open
- Category selector keyboard-navigable
- ARIA labels on all form elements

## 20. Analytics
- Feedback Modal Opened
- Feedback Submitted (by category)
- Feedback Submission Failed

## 21. Testing Checklist
**Unit Tests**
- Message validation (empty, too long)
- Category requirement check

**API Tests**
- POST /feedback (valid, guest, logged-in, rate-limited)
