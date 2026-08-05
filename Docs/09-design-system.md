# Design System

> Supersedes the original ledger-themed draft. These are the finalized tokens, confirmed in review, plus the signature "search to disassemble" interaction pattern.

## 1. Design Direction
A calm, flat, editorial system — warm neutral surfaces, a single accent (red) reserved for whatever the user is actively focused on, and large light-weight numerals as the hero. Numbers and the sector currently in focus carry the color; everything else stays quiet neutral tones.

## 2. Color

| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#e8e6e1` | Environment / page background |
| `--color-panel-white` | `#ffffff` | Primary card/panel surface |
| `--color-panel-soft` | `#f7f6f3` | Secondary/inset surface (nested cards, chips) |
| `--color-panel-taupe` | `#efece7` | Tertiary surface (track backgrounds, tags) |
| `--color-text-primary` | `#111111` | Headings, primary text |
| `--color-text-muted` | `#8b8985` | Supporting text, labels |
| `--color-text-light` | `#b0ada8` | Placeholders, disabled/quiet text |
| `--color-accent-red` | `#ea4335` | Single accent — active/selected/focused state only, never decorative |
| `--color-dark-button` | `#1a1a1a` | Primary button fill, primary data fill (e.g. progress rings, bars) |
| `--border-hairline` | `rgba(0,0,0,0.06)` | Default card border |
| `--border-glass` | `rgba(255,255,255,0.6)` | Border on floating/glass surfaces over the environment bg |

**Accent rule:** `--color-accent-red` is reserved for the thing the user is currently acting on — a selected sector pulled out of a chart, a live-status dot, an active filter. It never appears as a default/resting color. Everything at rest is neutral (ink, muted, taupe); red is how the interface says "this one, right now."

**Categorical color (multi-slice charts):** when more than one category needs distinct color and none are "selected," use a grayscale ramp from `--color-dark-button` (#1a1a1a) down through `--color-text-muted` (#8b8985) to `--color-text-light` (#b0ada8), largest/most important category darkest. Reserve `--color-accent-red` exclusively for whichever slice the user has searched for or selected — this is what makes the disassemble interaction (Section 9) read clearly.

## 3. Typography

- **Font:** Manrope, weights 200 / 400 / 500 / 600 / 700

| Role | Size / Weight | Use |
|---|---|---|
| Timer/hero display | 5rem / 200 | The single biggest number on a screen — total allocated, ring center stat |
| Session title | 2.5rem / 600 | Page or panel title (e.g. sector name once selected) |
| Clock/logo | 1.1rem–1.25rem / 500–700 | Nav logo, small persistent chrome |
| Body/meta | 0.8rem–0.875rem / 500–600 | Body copy, card meta, button labels |
| Tags/labels | 0.75rem / 600, uppercase, letter-spacing ~0.06em | Eyebrows, category tags, section labels |

## 4. Spacing & Shape

- Canvas reference: 1200px × 760px
- Outer radius: 32px (page-level containers)
- Card radius: 24px (panels, cards)
- Inner radius: 16px (nested cards, chips)
- Pill radius: 100px (buttons, badges, sliders, search bar)
- Grid gap: 24px (main layout), 20px (inner groups)
- Padding: 24px–32px on panels

## 5. Shadows

| Token | Value | Use |
|---|---|---|
| `--shadow-panel` | `0 20px 60px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.02)` | Resting cards/panels |
| `--shadow-glass` | `0 8px 32px rgba(0,0,0,0.08)` | Floating chips/status pills over the environment bg |
| `--shadow-button` | `0 4px 12px rgba(0,0,0,0.1)` | Primary buttons, badges |

## 6. Layout

- Main grid: `1fr 380px` for hero + sidebar layouts (e.g. Dashboard); `460px 1fr` for chart + detail layouts (e.g. Search)
- Sidebar stack: `auto 1fr auto` (status → scrollable content → actions)
- Motion: chart entrances ease in (~200ms), slider readouts update instantly with no delay, the visual (ring/chart) can ease ~150ms behind the number so it doesn't feel jittery. Respect `prefers-reduced-motion`.

## 7. Iconography
Tabler outline icons, 16–20px inline. Never color-only for state — pair increase/decrease with icons or text, not red/gray alone.

## 8. Chart Assets — Lottie
Pie/donut charts and other animated data visuals are served as Lottie files rather than hand-built SVG in production, sourced from a shared `/resources` (or equivalent CDN) folder rather than generated per-request. Convention:
- One Lottie file per chart *type* (e.g. `pie-chart.json`, `donut-ring.json`), parameterized at runtime with the actual sector data — not one file per dataset.
- The interactive mockups built so far (Dashboard ring, Search pie) use hand-coded SVG as a stand-in for these Lottie assets; when the real files are supplied, swap the SVG generation for the Lottie player (`lottie-web`) driven by the same `data` array already used in the mockups, so slice colors, the accent-red "selected" override, and the explode/enlarge behavior carry over unchanged.
- Keep the accent rule (Section 2) when authoring or commissioning the Lottie files: only the active/selected segment uses `--color-accent-red`; all others stay on the grayscale ramp.

## 9. Signature Interaction — Search to Disassemble
The product's defining moment: a global pie/donut chart sits on the left. Searching for a sector doesn't just filter a list — it visually pulls that slice out of the whole (translated outward along its angle bisector, recolored to `--color-accent-red`, other slices dimmed to ~35% opacity), then mirrors an enlarged version of that same slice on the right, directly under the search bar, followed by:
1. A plain-language explanation of that sector's figure
2. An adjustment slider for simulating a change to that sector's allocation, with the tradeoff framed as "every other sector absorbs the difference proportionally"

This sequence (disassemble → enlarge → explain → simulate) is the template for any future "drill into one thing out of a whole" screen, not just budget search — comparisons and the standalone Simulator should reuse the same beats.

## 10. Accessibility Baseline
- Minimum contrast 4.5:1 for body text, 3:1 for large text/headings against `--color-bg` and panel surfaces
- Visible keyboard focus rings on all interactive elements
- Color (accent red vs. gray) is never the sole indicator of selection — pair with size change (enlarge), position change (explode), and text
