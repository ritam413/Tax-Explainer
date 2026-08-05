# Database Schema

Database: Supabase (Postgres)

## Core Tables (from original design)

### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| email | text | unique |
| pan | text | optional |
| country | text | |
| prof | text | profession, optional |
| theme_preference | text | 'light' \| 'dark', default 'light' |
| created_at | timestamp | |

### `budgets`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| country | text | |
| year | int | |
| category | text[] | array of categories |
| amount | numeric[] | array, parallel to category |
| created_at | timestamp | |

> Note: consider normalizing `category`/`amount` arrays into a separate `budget_categories` table (see below) for easier querying, filtering, and joins — arrays work for prototyping but complicate search/filter at scale.

### `budget_categories` (normalized, recommended)
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| budget_id | uuid | FK → budgets.id |
| category | text | e.g. "Education" |
| amount | numeric | |
| previous_year_amount | numeric | nullable |
| growth_percent | numeric | derived/cached |
| currency | text | |

### `bookmarks`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| budget_id | uuid | FK → budgets.id |
| created_at | timestamp | |

### `chats`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user | uuid | FK → users.id |
| message | text | user's question |
| response | text | AI's response |
| created_at | timestamp | |

## Additional Tables (introduced during feature specs)

### `comparisons`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id, nullable (guest allowed) |
| budget_id_a | uuid | FK → budgets.id |
| budget_id_b | uuid | FK → budgets.id |
| ai_summary | text | cached AI explanation of the diff |
| created_at | timestamp | |

### `ai_history`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id, nullable |
| budget_id | uuid | FK → budgets.id, nullable |
| prompt_context | jsonb | structured data sent to Gemini |
| response | text | |
| created_at | timestamp | |

### `feedback`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id, nullable (guest allowed) |
| category | text | 'bug' \| 'suggestion' \| 'confusing' \| 'other' |
| message | text | |
| context | text | page/feature the feedback was submitted from |
| created_at | timestamp | |

### `simulations` (optional — only if "save simulation" ships)
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id, nullable |
| budget_id | uuid | FK → budgets.id |
| adjusted_categories | jsonb | { category: delta_percent } |
| created_at | timestamp | |

## Relationships
```
users 1───* bookmarks *───1 budgets
users 1───* chats
users 1───* comparisons
users 1───* feedback
users 1───* simulations
budgets 1───* budget_categories
budgets 1───* bookmarks
budgets 1───* comparisons (as budget_id_a / budget_id_b)
```

## Row Level Security (RLS) Notes
- `bookmarks`, `chats`, `ai_history`, `comparisons`, `simulations`: users can only read/write rows where `user_id = auth.uid()`
- `feedback`: insert allowed for anyone (including anonymous); select restricted to admin role
- `budgets`, `budget_categories`: public read; write restricted to admin role
