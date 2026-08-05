# Pages / Screens

## Auth
### Landing
- AI-built landing page
- Purpose: hook a first-time visitor within 5 seconds, explain the product, CTA to sign up
- No login required

### Login / Signup
- Single page, tabbed (Login / Signup)
- Fields: email, password (login); name, email, password, country, PAN-optional (signup)

### Forgot Password
- Single field: email
- Sends reset link

## Core App
### Dashboard
- Default budget snapshot on load
- Sector selector
- Shortcuts: Search, Compare, Bookmarks, AI Explain teaser

### Search
- Search input + filters (country, year, category)
- Results list → links to Budget Detail

### Budget Detail
- Contains: Budget Overview, Charts (Visualization), AI Explain, Simulator (Tweaking & Updating), Bookmark action

### Compare
- Select two datasets (years or countries)
- Generates Comparison Result (charts + AI summary)
- Export/Share actions

### Bookmarks
- List of saved budget items/comparisons

### Profile
- View/edit name, country, profession
- Avatar

### Settings
- Dark mode toggle
- Other preferences

### Admin
- Upload/manage budget datasets (role-gated)

## System / Utility
### 404
- Not found state, link back to Dashboard

### Loading
- Global loading state (route transitions, initial app load)

### Error
- Generic error boundary screen with retry/back-to-dashboard action

## Page-Level Component Composition
| Page | Key Components |
|---|---|
| Landing | Hero, CTA Button |
| Login/Signup | Tabs, Input, Button, Toast |
| Dashboard | Navbar, Sidebar, Sector Selector, Chart Card, Summary Card |
| Search | Input, Country/Year Dropdown, Result Cards, Pagination |
| Budget Detail | Chart Card, AI Response Card, Sector Slider, Bookmark toggle |
| Compare | Country/Year Selector x2, Chart Card, AI Response Card, Export/Share buttons |
| Bookmarks | List of Cards, Pagination, Empty state |
| Profile/Settings | Tabs, Input, Avatar, Toggle |
| Admin | Table, Upload control |
| 404/Error | Illustration, Button |
