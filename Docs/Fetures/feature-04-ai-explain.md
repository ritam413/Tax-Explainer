# 📋 Feature Design Document

## 1. Feature Name
AI Explain

## 2. Problem Statement
Raw budget numbers don't mean much on their own — users need plain-language context on what a figure means, why it changed, and what it's compared to.

## 3. User Story
As a college student,
I want a one-line, simple AI explanation of a budget figure
so that I understand what it means without reading a research report.

## 4. Success Criteria
- ✓ AI response streams within 2 seconds of request
- ✓ Explanation is short (1–3 sentences) by default, with "explain more" option
- ✓ Response is grounded in the actual budget data (no hallucinated numbers)
- ✓ Explanation is cached to avoid repeat AI cost
- ✓ Gracefully degrades if AI service is down (show chart-only)

## 5. Screen(s)
```
Budget Detail / Search Result / Comparison
  ↓
AI Explain Card (inline)
  ↓
Expanded Chat (optional "ask a follow-up")
```

## 6. Navigation Flow
```
User views a budget line item
  ↓
Clicks "Explain this" (or auto-triggers on view)
  ↓
AI Explain Card streams in
  ↓
User can ask a follow-up → mini chat thread
```

## 7. UI Components
- AI Response Card (streaming text)
- Loader (typing indicator)
- "Explain more" button
- Follow-up Input
- Retry button
- Source/data reference chip (which budget row this refers to)

## 8. Data Required
- Country
- Budget Year
- Department/Category
- Allocated Amount
- Previous Year Amount (for context)
- Growth %

## 9. Data Source
| Data | Source |
|---|---|
| Structured budget data | Supabase |
| AI-generated explanation | Gemini API |
| Cached explanations | Redis |
| Chat history | Supabase (`chats` table) |

## 10. Database Tables
- `budgets`
- `chats` (id, user, message, response)

## 11. API Endpoints
- `POST /ai/explain`
- `POST /chat`

## 12. Business Logic
```
User requests explanation for a budget item
  ↓
Check Redis cache (keyed by budget id + version)
  ↓
Cache hit → stream cached response
  ↓
Cache miss → build structured prompt from budget data
  ↓
Send to Gemini API
  ↓
Stream response to UI
  ↓
Store explanation in Redis + log in `chats` table
```

## 13. Validation Rules
- Prompt must include real budget data (no explaining without a data anchor)
- Follow-up questions limited to same budget context (no open-ended chat)
- Max 3 follow-ups per session to control cost

## 14. States
**Loading**
- Typing indicator / skeleton text lines

**Empty**
- "Ask AI to explain this" prompt button (not auto-triggered, to save cost — optional)

**Success**
- Streamed explanation text + "explain more" option

**Error**
- Gemini unavailable → show chart-only fallback, hide AI card, toast: "AI explanation unavailable right now"
- Timeout → retry button

## 15. Permissions
| Role | Access |
|---|---|
| Guest | Limited AI explanations (rate-limited, no history saved) |
| Logged User | Full AI explain + chat history saved |
| Admin | Same as user |

## 16. Edge Cases
- Gemini API down or rate-limited
- Ambiguous/incomplete budget data for a line item
- User spams "explain more" repeatedly
- Explanation references outdated cached data after budget update
- Non-English budget category names

## 17. Performance
- Stream AI response token-by-token (don't block on full completion)
- Cache explanations per budget-id (TTL: 7 days, invalidate on data update)
- Batch structured prompt construction to minimize token count

## 18. Security
- Sanitize any user follow-up input before sending to Gemini
- Rate limit AI calls per user (prevent cost abuse)
- Never send PAN/personal user data to Gemini
- Log prompts/responses without PII

## 19. Accessibility
- Streamed text announced incrementally to screen readers (ARIA live, polite)
- Retry/expand buttons keyboard accessible
- Sufficient contrast on AI card background

## 20. Analytics
- AI Explain Requested
- AI Explain Success
- AI Explain Failed
- Follow-up Asked
- Explain More Clicked

## 21. Testing Checklist
**Unit Tests**
- Prompt construction from budget data
- Cache key generation

**API Tests**
- POST /ai/explain (valid budget id, invalid id, cached vs uncached)
- POST /chat (valid follow-up, rate-limited)
