# User Flow

## Legend
Blue arrows = navigation flow (from original wireframe notes).

## 1. Core Journey (First-Time User)
```
Landing
  ↓
Login / Signup
  ↓
Dashboard
  ↓
Search
  ↓
Select Sector / "Everything"
  ↓
AI Explain  ←→  Charts
  ↓
Let User Tweak Proportion (Simulator) — shows what gets affected
  ↓
Bookmark  ←  Share
```

## 2. Detailed Step-by-Step

1. **Landing** — AI-built landing page, no login required, explains the product in one screen.
2. **Login/Signup** — single page, tabbed. New users sign up with name/email/password/PAN(optional)/country/profession.
3. **Dashboard** — immediately shows a default budget snapshot (no empty state on first load). Sector selector at top.
4. **Search** — user searches or selects a sector/category.
5. **Select Sector / Everything** — narrows to a specific budget slice or views the full picture.
6. **AI Explain & Charts** — run in parallel; AI gives the plain-language summary, Charts give the visual. Neither blocks the other.
7. **Simulator ("let user tweak proportion")** — user can drag a slider to see predicted downstream effects on other sectors.
8. **Bookmark / Share** — user saves or shares the result.

## 3. Comparison Journey
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

## 4. Journalist Journey (Comparison-focused)
```
Landing → Login → Dashboard → Compare → Select two datasets → AI Summary of change → Export/Share
```

## 5. Researcher Journey (Export-focused)
```
Landing → Login → Dashboard → Search → Budget Detail → Export Data (PDF/CSV)
```

## 6. Account Management Journey
```
Dashboard → Avatar → Profile → Edit info / Toggle Dark Mode → Save
Dashboard → Avatar → Settings → Preferences → Save
Anywhere → Feedback → Submit → Confirmation
```

## 7. Auth Edge Journey
```
Login → Forgot Password → Enter Email → Reset Link Sent → Reset Password → Login
```

## Notes from Original Planning
- No need to catch attention within 5 seconds — must "hook" the student persona immediately with something simple.
- The simulator step exists specifically to make the abstract concrete: "we try to predict this" — i.e., show the downstream effect of a hypothetical reallocation.
