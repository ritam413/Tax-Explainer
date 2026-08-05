# 📋 Feature Design Document

## 1. Feature Name
Budget Reallocation Simulator (Drag-to-Adjust Slider)

## 2. Problem Statement
Users understand budget numbers better through cause-and-effect than static figures — they want to explore "what if" a sector got more/less funding and immediately see which other sectors would be affected.

## 3. User Story
As a college student,
I want to drag a slider to increase or decrease funding for one sector
so that I can instantly see, in real time, which other sectors get cut or boosted as a result.

## 4. Success Criteria
- ✓ Dragging the slider updates affected sectors in real time (<100ms, no page reload)
- ✓ The simulation clearly shows which sectors lose/gain and by how much
- ✓ The total budget stays balanced (zero-sum) as the user drags
- ✓ User can reset to original values with one click
- ✓ Simulation is clearly labeled as hypothetical, not real government data

## 5. Screen(s)
```
Budget Detail
  ↓
Simulator Panel (slider per sector)
  ↓
Real-Time Impact View (charts + affected sector list)
```

## 6. Navigation Flow
```
Budget Detail
  ↓
Click "Try it yourself" / "What if?"
  ↓
Simulator Panel opens
  ↓
Drag slider on a sector
  ↓
Impact updates live
  ↓
Reset / Share / Ask AI to explain the tradeoff
```

## 7. UI Components
- Slider (per sector, draggable, with current % / amount label)
- Sector List with live delta indicators (▲/▼)
- Chart Card (updates live as slider moves)
- Reset Button
- "Ask AI to explain this tradeoff" button
- Share Button
- Disclaimer badge ("Hypothetical simulation")

## 8. Data Required
- Country
- Budget Year
- Category
- Allocated Amount (baseline, per sector)
- Total Budget (baseline)
- Adjustable range/limits per sector (min/max % change allowed)

## 9. Data Source
| Data | Source |
|---|---|
| Baseline budget data | Supabase |
| Reallocation logic | Client-side computation (no AI/DB call needed for the math itself) |
| AI tradeoff explanation | Gemini API (on demand) |
| Cached baseline | Redis |

## 10. Database Tables
- `budgets`
- `budget_categories`
- (No new table needed — simulation state is client-side/ephemeral unless "save simulation" is added later)

## 11. API Endpoints
- `GET /budgets/:id` (baseline data, reused from existing feature)
- `POST /ai/explain` (reused, with simulated delta as context, on demand only)

## 12. Business Logic
```
Load baseline budget data for selected country/year
  ↓
User drags slider for Sector A
  ↓
Calculate delta (amount added/removed from Sector A)
  ↓
Distribute the inverse delta proportionally across other sectors
  (client-side, real-time — no server round trip)
  ↓
Update chart + sector list with live values
  ↓
User can pause and click "Explain this tradeoff"
  ↓
Send baseline + simulated delta to Gemini for a plain-language summary
```

## 13. Validation Rules
- Total simulated budget must always equal baseline total (zero-sum constraint)
- Slider cannot push any sector below 0
- Slider range capped (e.g. ±50% of baseline) to keep simulation realistic
- Reset must fully restore original baseline values

## 14. States
**Loading**
- Skeleton sliders while baseline data loads

**Empty**
- N/A (baseline data required before simulator can render — fallback to "Simulator unavailable for this dataset" if missing)

**Success**
- Live-updating sliders, chart, and affected-sector list

**Error**
- Baseline data fetch failed → "Couldn't load simulator" + retry
- AI explanation failed → simulator still works, just show "AI explanation unavailable" inline

## 15. Permissions
| Role | Access |
|---|---|
| Guest | Can use simulator (not saved) |
| Logged User | Can use simulator + save/share a simulation snapshot |
| Admin | Same as user |

## 16. Edge Cases
- User drags slider to extreme values rapidly (debounce chart re-render, not the drag itself)
- Sector with very small baseline amount (dragging % feels disproportionate)
- Multiple sectors dragged in sequence (deltas must recompute correctly each time, not stack incorrectly)
- Mobile touch drag precision (fat-finger adjustments)
- User shares a simulation link — recipient must see the exact same simulated state

## 17. Performance
- All redistribution math done client-side (no network latency on drag)
- Debounce/throttle chart re-render to ~60fps max, not every pixel of drag
- Only call AI on explicit "Explain this tradeoff" click, never on every drag tick

## 18. Security
- Simulated values never written to real `budgets` table (read-only baseline, simulation is ephemeral/client state)
- If "save simulation" is added, store as a separate `simulations` table, clearly separated from authoritative budget data
- Rate limit AI explanation calls tied to this feature

## 19. Accessibility
- Sliders operable via keyboard (arrow keys to adjust)
- ARIA live region announces updated values as slider moves (throttled, not on every pixel)
- Clear text summary of current deltas alongside the visual chart
- Sufficient contrast on increase/decrease indicators (not color-only — use icons/text too)

## 20. Analytics
- Simulator Opened
- Slider Adjusted (sector, direction)
- Simulation Reset
- AI Tradeoff Explanation Requested
- Simulation Shared

## 21. Testing Checklist
**Unit Tests**
- Zero-sum redistribution logic
- Min/max clamping per sector
- Reset restores exact baseline

**API Tests**
- GET /budgets/:id (baseline for simulator)
- POST /ai/explain (with simulated delta payload)
