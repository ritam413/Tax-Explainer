# Product Requirements Document (PRD)

## 1. Product Name
AI Tax / Budget Explainer

## 2. Vision
Help citizens build and understand government budgets through an interactive, AI-powered visualizer — turning dense government PDFs into something a person can grasp in under 5 seconds.

## 3. Problem Statement
Government budget documents are long, jargon-heavy PDFs. Most citizens — especially students — never read them, so they have no real sense of where public money goes or how it changes year over year.

## 4. Target Users

### Primary Persona: Student
- Age: ~19
- Wants: simple, one-line explanations; a "dopamine hit," not a research assignment
- Needs to be hooked within 5 seconds — won't read a wall of text
- Pain point: government PDFs take too long to read

### Secondary Persona: Journalist
- Needs: compare budgets (across years/countries) quickly for stories

### Secondary Persona: Researcher
- Needs: export structured data for further analysis

## 5. Solution
An interactive AI visualizer that lets users search, explore, compare, and simulate government budgets, with plain-language AI explanations layered on top of real data.

## 6. Goals
- Teach users where their taxes go, in the simplest form possible
- Make budget exploration feel fast and rewarding, not like homework
- Support deeper use cases (comparison, export) without slowing down the core experience

## 7. Non-Goals (Out of Scope for v1)
- Multiplayer / chat
- Marketplace
- Full social community features
(See MoSCoW in Section 9 — these are "Won't Have")

## 8. Core Features (Summary)
| Feature | Priority |
|---|---|

| Dashboard | Must Have |
| Budget Search | Must Have |
| AI Explain | Must Have |
| Charts | Must Have |
| Country/Year Compare | Must Have |
| Budget Reallocation Simulator | Must Have (added post-MVP scoping) |
| Bookmarks | Should Have |
| Dark Mode | Should Have |
| Profile | Should Have |
| Feedback | Could Have |
| Profile 3D Visualizer | Could Have |
| Community | Could Have |
| Voice Assistant | Could Have |
| Multiplayer / Chat / Marketplace | Won't Have |

See `02-features.md` for full feature specs.

## 9. MoSCoW Prioritization

**Must Have**

- Dashboard
- Budget Search
- AI Explain
- Charts
- Country Compare

**Should Have**
- Bookmark
- Dark Mode
- Profile

**Could Have**
- Feedback
- Profile 3D Visualizer
- Community
- Voice Assistant

**Won't Have**
- Multiplayer / Chat
- Marketplace

## 10. Success Metrics
- Time-to-first-insight (landing → first AI explanation viewed) under 5 seconds
- % of sessions that view at least one chart
- % of users who bookmark or share at least one budget item
- AI explanation satisfaction (thumbs up/down or feedback rate)
- Return usage (7-day retention)

## 11. Key Risks
- Government data availability/reliability across countries and years
- AI cost scaling with usage (mitigated via Redis caching of AI responses)
- Complexity of "real" budget data vs. the simplicity users expect

## 12. Related Documents
- `02-features.md` — feature specs
- `03-user-flow.md` — user journeys
- `04-information-architecture.md` — site structure
- `05-database-schema.md` — data model
- `06-api-design.md` — API contract
- `07-components.md` — UI component inventory
- `08-pages.md` — screen inventory
- `09-design-system.md` — design tokens & visual system
- `10-development-roadmap.md` — build phases
- `11-testing.md` — testing strategy
- `12-deployment.md` — architecture & deployment
