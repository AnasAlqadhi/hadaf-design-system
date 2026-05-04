# Hadaf (هدف) — Developer & AI Guide

> **For any developer or AI assistant picking up this project:** Read this file first. It explains the entire architecture, conventions, file responsibilities, and how to safely extend the system without breaking anything.

---

## 1. Project Identity

| Property | Value |
|---|---|
| **Brand name** | Hadaf (هدف — Arabic for "Goal") |
| **Product type** | Arabic-first football news website |
| **Primary language** | Arabic (RTL) |
| **Secondary language** | English (LTR) |
| **Live URL** | https://anasalqadhi.github.io/hadaf-design-system/ |
| **GitHub repo** | https://github.com/AnasAlqadhi/hadaf-design-system |
| **Branch** | `main` (GitHub Pages serves from root) |
| **Current version** | v0.3 |

---

## 2. Tech Stack

**No build step. No bundler. No node_modules.**

| Layer | Technology | How it's loaded |
|---|---|---|
| UI framework | React 18 (UMD) | `<script src="https://unpkg.com/react@18/umd/react.development.js">` |
| JSX transform | Babel Standalone | `<script src="https://unpkg.com/@babel/standalone/babel.min.js">` |
| Styling | Plain CSS with custom properties | `<link rel="stylesheet" href="...">` |
| Icons | Lucide (CDN) | `<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js">` |
| Fonts | Google Fonts | `<link href="https://fonts.googleapis.com/css2?family=...">` |
| Hosting | GitHub Pages | Auto-serves from repo root on `main` |

**Why no build step?** Speed of iteration. The entire site runs by opening `site/index.html` (or any `preview/*.html`) in a browser — no terminal needed for basic viewing.

**Limitation:** All JSX files use `type="text/babel"` in the HTML `<script>` tags. Babel compiles them in the browser at runtime. This is fine for development and a small-to-medium production site, but should be replaced with Vite or Next.js when the team grows.

---

## 3. Repository Structure

```
a:\hadaf\
│
├── README.md                   ← Brand brief, visual foundations, content rules
├── DEVELOPER_GUIDE.md          ← YOU ARE HERE — technical reference
├── SKILL.md                    ← Claude/AI skill manifest for this system
│
├── colors_and_type.css         ← MASTER TOKEN FILE — all CSS custom properties
├── design-system.html          ← Visual showcase of all 24 design system cards
│
├── site/                       ← THE LIVE WEBSITE (served by GitHub Pages)
│   ├── index.html              ← Entry point — loads fonts, CSS, all JSX
│   ├── styles.css              ← All component CSS (~1000 lines)
│   ├── App.jsx                 ← Root component: routing, theme state, data
│   ├── Nav.jsx                 ← Top navigation bar + theme switcher
│   ├── Hero.jsx                ← Full-bleed hero section
│   ├── MatchCard.jsx           ← Individual match score card
│   ├── ArticleCard.jsx         ← News article preview card
│   ├── LeagueTable.jsx         ← Standings table (full + compact modes)
│   └── Bits.jsx                ← Small shared components: LiveTicker, AdSlot, Footer
│
├── preview/                    ← 24 standalone HTML preview cards for design tokens
│   ├── 01-logo.html
│   ├── 02-colors-brand.html
│   ├── ...
│   └── 24-crests.html
│
├── assets/
│   ├── logo/                   ← Wordmark SVGs (placeholder)
│   ├── icons/sport/            ← Custom sport SVG icons
│   ├── crests/                 ← Team crest placeholders
│   ├── imagery/                ← Match photography (placeholders — replace before launch)
│   └── patterns/               ← star-tile.svg (8-point geometric pattern)
│
└── ui_kits/website/            ← Legacy copy of site/ — kept for reference only
```

**Key rule:** `site/` is the canonical source of truth. `ui_kits/website/` is a frozen snapshot and should not be edited.

---

## 4. Design Token System

### File: `colors_and_type.css`

This is the **single source of truth** for all visual values. Every component in `site/styles.css` references tokens from this file — never hardcoded hex values.

### Theme Architecture

Three themes are defined using CSS attribute selectors:

```css
:root { ... }                      /* Default: warm light theme */
[data-theme="dark"] { ... }        /* Dark: modern dark theme */
[data-theme="match-night"] { ... } /* Match-Night: high-contrast stadium */
```

The `data-theme` attribute is set on `<html>` by React (see `App.jsx`). Switching themes instantly re-skins all components via CSS cascade.

### Token Groups

| Group | Prefix | Example |
|---|---|---|
| Green scale | `--green-*` | `--green-700: #0E5C3A` |
| Gold scale | `--gold-*` | `--gold-500: #D4A437` |
| Semantic colors | `--*` | `--live-red`, `--success`, `--warn` |
| Surface colors | `--surface-*` | `--surface-1`, `--surface-2` |
| Text colors | `--text-*` | `--text-primary`, `--text-muted` |
| Borders | `--border*` | `--border`, `--border-strong` |
| Shadows | `--shadow-*` | `--shadow-0` through `--shadow-4` |
| Spacing | `--sp-*` | `--sp-1` (4px) through `--sp-12` (96px) |
| Radii | `--radius-*` | `--radius-sm` through `--radius-full` |
| Animation | `--dur-*`, `--ease-*` | `--dur-base: 200ms` |
| Typography | `--font-*`, `--text-*` | `--font-ar-display`, `--text-xl` |

### Adding a New Token

1. Add it to `:root` in `colors_and_type.css`
2. If it needs to change per-theme, add overrides in `[data-theme="dark"]` and `[data-theme="match-night"]`
3. Use it in `site/styles.css` as `var(--your-token)`

**Never** add raw color values to `site/styles.css`. Always use tokens.

---

## 5. Theme System (React Side)

### How it works

**`site/App.jsx`** manages theme state:

```jsx
const [theme, setTheme] = React.useState(
  () => localStorage.getItem('hadaf-theme') || 'default'
);

React.useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme === 'default' ? '' : theme);
  localStorage.setItem('hadaf-theme', theme);
}, [theme]);
```

- `theme` state: `'default'` | `'dark'` | `'match-night'`
- `localStorage` key: `hadaf-theme`
- The `data-theme` attribute on `<html>` drives all CSS

### ThemeSwitcher (in Nav.jsx)

Three-button toggle. Each button has `aria-pressed={theme === '...'}`. Icons are inline SVG (sun / moon / fire), not emoji.

### To add a new theme

1. Add a new `[data-theme="your-theme"]` block in `colors_and_type.css`
2. Add a new button in the `ThemeSwitcher` in `Nav.jsx`
3. The state in `App.jsx` will handle it automatically

---

## 6. RTL / LTR Language Toggle

**`site/App.jsx`** also manages language:

```jsx
const [lang, setLang] = React.useState('ar');

React.useEffect(() => {
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);
}, [lang]);
```

- All components receive `lang` as a prop
- Text content is selected with a helper: `t(ar, en)` returns the correct string
- **RTL is the primary direction** — always test Arabic first

### Component pattern for bilingual text

```jsx
const t = (ar, en) => lang === 'ar' ? ar : en;
// usage:
<h1>{t('أبرز الأخبار', 'Top Stories')}</h1>
```

---

## 7. Component Reference

### `App.jsx`
- **Role:** Root orchestrator
- **State:** `theme`, `lang`
- **Data:** All static mock data lives here as constants (`ARTICLES`, `MATCHES`, `STANDINGS`)
- **Layout:** Renders `<Nav>` + route-based views (Home, League, Article) inside a `<main>`
- **Sidebar:** On Home view, renders `<HdLeagueTable compact>` with top 5 standings

### `Nav.jsx`
- **Role:** Sticky top navigation
- **Props:** `lang`, `setLang`, `theme`, `setTheme`
- **Key parts:** Logo wordmark, nav links, language toggle button, `ThemeSwitcher`
- **CSS class:** `.hd-nav` (glassmorphic, `backdrop-filter: blur(16px)`)

### `Hero.jsx`
- **Role:** Full-bleed hero section for the lead story
- **Props:** `article` (object with `title`, `kicker`, `image`, `time`, `readTime`), `lang`
- **Key parts:**
  - `.hd-hero-kicker` — pulse-dot pill badge ("عاجل" / "Breaking")
  - `.hd-hero-title` — large Arabic display headline
  - `.hd-hero-read` — gold CTA button
  - `.hd-hero-footer` — flex row with time + read time stats
- **Background:** CSS `background-image` with dual scrim overlay. Falls back to green gradient if no image

### `MatchCard.jsx`
- **Role:** Shows one match score
- **Props:** `match` (object), `lang`, `compact` (bool)
- **Live state:** If `match.minute` exists, adds `.is-live` class → red left-border + pulsing clock
- **CSS classes:** `.hd-match`, `.hd-match.is-live`, `.hd-match.is-compact`

### `ArticleCard.jsx`
- **Role:** Article preview card (image + headline + meta)
- **Props:** `article` (object), `lang`, `variant` (`'default'` | `'feature'`)
- **Fallback colors:** When no image, each card slot gets a unique green gradient via nth-child

### `LeagueTable.jsx`
- **Role:** Standings table
- **Props:** `rows` (array), `lang`, `compact` (bool)
- **Compact mode:** Renders 3 columns only (rank, team name, points) — used in homepage sidebar
- **Full mode:** 9 columns (rank, team, P, W, D, L, GF, GA, Pts)

### `Bits.jsx`
Three components in one file:

| Export | Role | CSS class |
|---|---|---|
| `LiveTicker` | Scrolling horizontal news ticker | `.hd-ticker` |
| `AdSlot` | Reserved ad space placeholder | `.hd-ad-slot` |
| `Footer` | Page footer | `.hd-footer` |

---

## 8. CSS Architecture (`site/styles.css`)

### Naming convention

BEM-inspired with `hd-` prefix:

```
.hd-[block]              → component root
.hd-[block]-[element]    → child element
.hd-[block].is-[state]   → state modifier
```

Examples:
- `.hd-nav`, `.hd-nav-logo`, `.hd-nav-links`
- `.hd-match`, `.hd-match.is-live`, `.hd-match.is-compact`
- `.hd-card`, `.hd-card-img`, `.hd-card-title`

### File structure (in order)

1. Reset & base (`*, body, ::selection`)
2. Layout utilities (`.hd-container`, `.hd-grid`, `.hd-mt-sm`)
3. Navigation (`.hd-nav`)
4. Hero (`.hd-hero`, `.hd-hero-*`)
5. Live Ticker (`.hd-ticker`)
6. Article Cards (`.hd-card`)
7. Match Cards (`.hd-match`)
8. League Table (`.hd-table`)
9. Buttons (`.hd-btn`, `.hd-btn-*`)
10. Badges (`.hd-badge`)
11. Theme Switcher (`.hd-theme-switcher`)
12. Footer (`.hd-footer`)
13. Ad slot (`.hd-ad-slot`)
14. Responsive breakpoints (`@media (max-width: 900px)`, `@media (max-width: 600px)`)

### Rules

- **No hardcoded colors** — always `var(--token-name)`
- **No `!important`** unless overriding third-party styles
- **No `z-index` over 1000** without a comment explaining why
- **All transitions** use `var(--dur-base)` and `var(--ease-out)` unless intentionally different

---

## 9. Data / Mock Content

All data is mocked in `site/App.jsx`. When real APIs are ready, replace these constants:

| Constant | Shape | Used by |
|---|---|---|
| `ARTICLES` | `[{ id, title, titleEn, kicker, image, time, readTime }]` | `Hero`, `ArticleCard` |
| `MATCHES` | `[{ id, homeTeam, awayTeam, homeScore, awayScore, minute, status, competition }]` | `MatchCard` |
| `STANDINGS` | `[{ rank, team, teamEn, p, w, d, l, gf, ga, pts }]` | `LeagueTable` |

### Hero article

The first item in `ARTICLES` (`ARTICLES[0]`) is always used as the hero. To change the hero, edit the first array entry or restructure `App.jsx` to accept a `featuredId`.

### Hero image

Currently: `assets/imagery/match-action-1.svg` (placeholder)

To add a real photo:
1. Drop the file into `assets/imagery/`
2. Update `ARTICLES[0].image` in `App.jsx` to the new filename
3. The hero CSS handles the rest (object-fit, scrim, etc.)

---

## 10. Design System Showcase (`design-system.html`)

Standalone HTML page — does **not** use React. Pure HTML + CSS + vanilla JS.

- Imports `colors_and_type.css` for all tokens
- Has a fixed-position theme switcher (`id="themeSwitch"`) that writes `data-theme` to `<html>`
- 24 component cards organized in 4 sections: Brand, Color, Typography, Components
- Self-contained — safe to share, screenshot, or print

---

## 11. Preview Pages (`preview/`)

24 individual HTML files, one per design token category or component. Each:
- Is standalone HTML
- Should import `../colors_and_type.css`
- Currently may not have a theme switcher — this is a known gap

**Known issue:** Some preview pages may not correctly inherit the v0.3 token system. They need to be updated to link `colors_and_type.css` and add the theme switcher JS. This is low priority — the `design-system.html` page is the canonical showcase.

---

## 12. How to Run Locally

No install needed. Just serve the files over HTTP:

```powershell
cd a:\hadaf
python -m http.server 8000
```

Then open:
- `http://localhost:8000/site/index.html` — the live website
- `http://localhost:8000/design-system.html` — the design system showcase
- `http://localhost:8000/preview/01-logo.html` — individual preview cards

**Why not just open the HTML file directly?** Babel's runtime JSX compilation requires HTTP (not `file://`) to load modules correctly. Always use a local server.

---

## 13. How to Deploy

After making changes:

```powershell
cd a:\hadaf
git add -A
git commit -m "your short message"
git push
```

GitHub Pages auto-publishes from the `main` branch root within ~30 seconds. No CI/CD, no build step needed.

**Note:** The site root is `a:\hadaf\`, NOT `a:\hadaf\site\`. GitHub Pages serves `index.html` from the root. The main site entry point is `site/index.html` — you navigate to it manually or via links.

---

## 14. Known Gaps & Future Work

| Item | Priority | Notes |
|---|---|---|
| Real hero photography | High | Drop into `assets/imagery/`, update `ARTICLES[0].image` |
| Logo / wordmark for هدف | High | Currently typeset only — needs a proper SVG mark |
| WCAG contrast audit | Medium | All 3 themes need to be checked against AA contrast ratios |
| Update 24 preview pages | Low | Add theme switcher + correct token link to each |
| Replace Babel runtime | Low | Use Vite or Next.js when team grows — current runtime compile is slow on cold load |
| Real API integration | Future | Replace mock constants in `App.jsx` with live data fetches |
| Ad slot activation | Future | `AdSlot` component exists in `Bits.jsx` — hidden until monetization |
| Article page | Future | Currently mocked as a view in `App.jsx` — needs real routing |

---

## 15. Conventions for AI Assistants

If you are an AI assistant working on this codebase, follow these rules:

1. **Always use design tokens** from `colors_and_type.css` — never hardcode hex values in CSS
2. **Theme-aware by default** — any new CSS rule that sets a color MUST work across all 3 themes. If it doesn't adapt, add overrides in `[data-theme="dark"]` and `[data-theme="match-night"]`
3. **RTL-first** — test layouts in Arabic (`dir="rtl"`) before checking English
4. **No emoji in UI** — use Lucide SVG icons or custom SVGs from `assets/icons/sport/`
5. **No colored card borders** — this is explicitly banned by the design system (see README Visual Foundations → Cards)
6. **No decorative gradients** — the only gradient allowed is the hero photo scrim (`--protect-grad`)
7. **BEM naming** — new CSS classes follow `.hd-[block]-[element].is-[state]` pattern
8. **Keep components in their files** — don't add new JSX to `index.html` directly
9. **Mock data stays in App.jsx** — components receive data as props; they don't fetch or store data themselves
10. **Short git commit messages** — PowerShell terminal has a display bug with long messages; keep under 72 chars
