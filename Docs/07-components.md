# Component Inventory

## Layout
- Navbar
- Sidebar
- Page Header

## Content
- Cards (generic content card)
- Chart Card (Lottie-based animated charts)
- AI Response Card (streaming text)
- Summary Card

## Form / Input
- Buttons (primary, secondary, loading state)
- Input (text, email, password)
- Dropdown (country, year, category)
- Country Selector
- Year Dropdown
- Sector Slider (for Budget Simulator)

## Feedback / Status
- Toast (success/error/info)
- Modal (feedback, share dialog, expanded chart)
- Loader (Lottie loading animation, spinner)
- Skeleton (loading placeholders for cards/lists)

## Navigation / Discovery
- Pagination
- Tabs (e.g. Profile / Settings, Login / Signup)
- Badge (e.g. new, updated, category tag)

## Identity
- Avatar

## Component-to-Feature Mapping
| Component | Used In |
|---|---|
| Navbar, Sidebar, Page Header | All authenticated screens |
| Chart Card | Dashboard, Budget Detail, Comparison, Simulator |
| AI Response Card | AI Explain, Comparison, Simulator tradeoff |
| Country Selector, Year Dropdown | Search, Compare, Dashboard |
| Sector Slider | Budget Simulator |
| Toast | Auth, Bookmarks, Feedback, Profile, all error states |
| Modal | Feedback, Share Dialog, Expanded Chart |
| Loader / Skeleton | Every data-fetching screen |
| Pagination | Search Results, Bookmarks list |
| Tabs | Login/Signup, Profile/Settings |
| Badge | Category tags, comparison deltas |
| Avatar | Navbar, Profile |

## Design Token Status
Design tokens (color scale, spacing scale, typography scale) are not yet finalized — see `09-design-system.md` for the proposed starting system.
