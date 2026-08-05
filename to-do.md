# Detailed Development Tasks

## Phase 0 — Foundation
- [ ] **Repository Setup**: Initialize a Next.js 15 app using the App Router. Install and configure Tailwind CSS and TypeScript. Set up ESLint and Prettier for code consistency.
- [ ] **Supabase Setup**: Create a Supabase project. Define the Postgres schema with tables for `users`, `budgets`, `budget_categories`, `bookmarks`, and `chats`. Set up Row Level Security (RLS) policies.
- [ ] **Design Tokens**: Translate the design system (`09-design-system.md`) into a Tailwind config and CSS variables for colors, typography, spacing, and shadows.
- [ ] **Deployment**: Configure a Vercel deployment pipeline for staging and production environments. Securely set up necessary environment variables (Supabase keys, Gemini API key, Redis URL).

## Phase 1 — Must Haves
- [ ] **Dashboard**: Build the landing dashboard summarizing the default/latest budget. Connect to Redis to cache the snapshot, ensuring <2s load times. Build the global layout (Sidebar, Navbar, Mobile Menu).
- [ ] **Budget Search**: Create a debounced search input (300ms). Build the API route `GET /budgets?query=...` with Redis caching. Implement pagination, fuzzy matching (ILIKE), and gracefully handle empty states.
- [ ] **Charts & Visualization**: Implement a charting library. Build reusable Chart Cards (Pie/Bar variants). Add interactive tooltips, legends, ensure responsive resizing, and provide accessible text alternatives.
- [ ] **AI Explain**: Integrate the Gemini API. Build `POST /ai/explain` and `POST /chat` endpoints. Implement token-by-token streaming to the UI. Cache AI responses in Redis using `budget_id` + `promptVersion` keys. Build the UI for the streaming AI card and chat follow-ups.
- [ ] **Country/Year Comparison**: Build a dedicated view that fetches two budget datasets and displays them side-by-side, heavily reusing the Chart components.

## Phase 2 — Core Differentiator
- [ ] **Budget Reallocation Simulator**:
  - Build the draggable slider UI for each budget sector.
  - Implement client-side zero-sum redistribution logic (increasing one sector automatically decreases others proportionally without a server round-trip).
  - Ensure real-time chart and list updates (<100ms) while debouncing visually heavy renders.
  - Add an "Ask AI to explain tradeoff" button that passes the simulated deltas to the Gemini API.
  - Implement a Reset button to easily revert to baseline data.

## Phase 3 — Should Haves
- [ ] **Bookmarks**: Create the `bookmarks` API routes (`GET`, `POST`, `DELETE`). Build UI for toggling bookmarks on specific budget items and a dedicated Bookmarks page in the dashboard.
- [ ] **Dark Mode**: Implement a global theme toggle. Store preference in Supabase for logged-in users (`users.theme_preference`) and fall back to system preference for guests. Ensure contrast compliance across all charts and UI components.
- [ ] **Profile & Settings**: Build a profile management page allowing users to update their details and manage preferences.

## Phase 4 — Could Haves
- [ ] **Feedback Mechanism**: Create a simple form for users to submit feedback and store it in a `feedback` table.
- [ ] **Profile 3D Visualizer**: Conduct a design spike and implement a 3D visualization of user activity (if time permits).
- [ ] **Community & Voice Assistant**: Explore and implement features for social sharing and voice-prompted budget searches.

## Cross-Cutting / Ongoing
- [ ] **Testing**: Write Vitest/Jest unit tests for core logic (e.g., Simulator zero-sum math, AI prompt builders). Write API and component tests alongside feature development.
- [ ] **Accessibility**: Ensure complete keyboard navigation, ARIA live region announcements (for AI streams and slider updates), and color contrast on all newly built features.
- [ ] **Analytics**: Instrument key events such as `Simulator Opened`, `Search Performed`, and `AI Explain Requested`.
- [ ] **Admin Panel**: Build a minimal internal UI to seed and manage actual government budget data.
