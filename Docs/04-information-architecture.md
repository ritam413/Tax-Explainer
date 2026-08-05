# Information Architecture

## 1. Top-Level Structure
```
├── Login
├── Dashboard
│   ├── Budget Overview
│   ├── Search
│   ├── Compare
│   ├── AI Explain
│   └── Charts
├── Profile
├── Settings
└── Admin
```

## 2. Screens

### Auth
- Landing (AI-built landing page)
- Login / Signup (single page, tabbed)
- Forgot Password

### Core App
- Dashboard
  - Search
  - Budget Details
  - Visualization (Charts)
  - Tweaking & Updating (Simulator)
  - Compare
  - Bookmark
  - Profile / Settings (shortcut)
  - Dark Mode toggle (shortcut)

### System / Utility
- 404
- Loading
- Error

## 3. Navigation Model
- **Primary nav (persistent):** Dashboard, Search, Compare, Bookmarks, Profile
- **Secondary nav (via avatar menu):** Profile, Settings, Logout
- **Contextual nav:** Feedback accessible from any screen; Admin only visible to admin role

## 4. Route Map (proposed)
| Route | Screen |
|---|---|
| `/` | Landing |
| `/login` | Login / Signup |
| `/forgot-password` | Forgot Password |
| `/dashboard` | Dashboard |
| `/search` | Search |
| `/budget/:id` | Budget Detail (Charts, AI Explain, Simulator) |
| `/compare` | Compare setup |
| `/compare/result` | Comparison Result |
| `/bookmarks` | Bookmarks list |
| `/profile` | Profile |
| `/settings` | Settings |
| `/admin` | Admin (role-gated) |
| `/404` | Not Found |

## 5. Access Levels by Section
| Section | Guest | Logged User | Admin |
|---|---|---|---|
| Landing | ✓ | ✓ | ✓ |
| Search | ✓ | ✓ | ✓ |
| Budget Detail | ✓ | ✓ | ✓ |
| Compare | ✓ | ✓ | ✓ |
| Bookmarks | ✗ (prompt to log in) | ✓ | ✓ |
| Profile / Settings | ✗ | ✓ | ✓ |
| Admin | ✗ | ✗ | ✓ |
