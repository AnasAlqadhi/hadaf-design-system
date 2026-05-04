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
| **Current version** | v0.5 |

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
- **State:** `theme`, `lang`, `route`, `article`
- **Data:** Static mock constants (`ARTICLES`, `LIVE`, `FEED`, `STANDINGS`) used as fallback; `HomeView` fetches real news and replaces `feed` + `hero` state on load
- **Error handling:** `ErrorBoundary` class wraps the entire render tree
- **Routes:** `home` | `scores` | `league` | `article` | `ucl` | `wc` | `video`

### `Nav.jsx`
- **Role:** Sticky top navigation
- **Props:** `lang`, `setLang`, `theme`, `setTheme`, `route`, `setRoute`
- **Logo:** `<img src="assets/logo/hadaf-wordmark.png">` at 42px height
- **Nav items:** Home, Scores (النتائج), Saudi, UCL, World Cup, Video
- **CSS class:** `.hd-nav` (glassmorphic, `backdrop-filter: blur(16px)`)

### `Hero.jsx`
- **Role:** Full-bleed hero section for lead story
- **Props:** `kicker`, `title`, `image`, `lang`, `onClick`
- **Background:** `<img className="hd-hero-bg">` with `object-fit: cover`

### `MatchCard.jsx`
- **Role:** Shows one match score
- **Props:** `home`, `away`, `scoreHome`, `scoreAway`, `status`, `minute`, `lang`, `compact`
- **Live state:** `.is-live` class → red left-border + pulsing clock

### `ArticleCard.jsx`
- **Role:** Article preview card (3 variants)
- **Props:** `kicker`, `title`, `image`, `time`, `readMin`, `lang`, `variant`, `onClick`
- **Variants:** `feature` (large), `standard` (medium), `compact` (list row)
- **Image:** `<img>` tag with `object-fit: cover` inside `.hd-art-img`

### `LeagueTable.jsx`
- **Role:** Standings table
- **Props:** `rows`, `lang`, `compact`
- **Compact mode:** 3 columns (rank, team, pts) for sidebar
- **Full mode:** 9 columns

### `Bits.jsx`
Three components:

| Export | Role | CSS class |
|---|---|---|
| `LiveTicker` | Scrolling horizontal news ticker | `.hd-ticker` |
| `AdSlot` | Reserved ad space placeholder | `.hd-ad-slot` |
| `Footer` | Page footer with logo | `.hd-footer` |

### `ScoresView.jsx` (NEW)
- **Role:** Full scores page — 365scores-style
- **Components:** `DateStrip` (Yesterday/Today/Tomorrow tabs), `CompetitionBlock` (collapsible), `MatchRow`
- **Data:** Fetches from `HadafAPI.getFixturesByDate(dateStr)` on date change
- **Export:** `window.HdScoresView`

### `api.js` (NEW)
- **Role:** API-Football v3 wrapper
- **Key:** Read from `window.HADAF_CONFIG.API_FOOTBALL_KEY`
- **Functions:** `getFixturesByDate(dateStr)`, `getLiveFixtures()`, `getStandings(leagueKey)`
- **Leagues:** saudi (307), ucl (2), premier (39), laliga (140), seriea (135), bundesliga (78) — all season 2025
- **Export:** `window.HadafAPI`

### `newsApi.js` (NEW)
- **Role:** RSS news fetcher — no auth needed
- **Method:** Fetches RSS via CORS proxy chain (codetabs → corsproxy.io → thingproxy), parses XML with `DOMParser`
- **Feeds:** `guardian_en`, `bbc_en`, `sky_en`, `espn`
- **Functions:** `getFeedArticles(feedKey, count)`, `getLatestNews(feedKeys, count)`
- **Export:** `window.HadafNews`

### `config.js` (NEW)
- **Role:** API key storage
- **Content:** `window.HADAF_CONFIG = { API_FOOTBALL_KEY: '' }`
- **Local dev:** Add your real key here; it will not affect GitHub Pages
- **Note:** Empty key is committed. The inline fallback in `index.html` ensures the app never crashes if this file is missing

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

## 9. Data Architecture

### Static mock data (in `App.jsx`)

Used as fallback when APIs are unavailable:

| Constant | Shape | Used by |
|---|---|---|
| `ARTICLES.hero` | `{ kicker, title, image, body }` | `Hero` (fallback) |
| `LIVE` | `[{ home, away, scoreHome, scoreAway, minute }]` | `LiveTicker`, `MatchCard` |
| `FEED` | `[{ kicker, title, image, time, readMin }]` | `ArticleCard` (fallback) |
| `STANDINGS` | `[{ team, p, w, d, l, gf, ga, pts }]` | `LeagueTable` |

### Live data sources

| Source | Module | What it provides |
|---|---|---|
| The Guardian Football RSS | `newsApi.js` | Real news articles, English |
| BBC Sport Football RSS | `newsApi.js` | Real news articles, English |
| API-Football v3 | `api.js` | Fixtures, live scores, standings |

### Home page data flow

1. `HomeView` renders instantly with mock `FEED` + `ARTICLES.hero`
2. On mount, calls `HadafNews.getLatestNews(['guardian_en', 'bbc_en'])`
3. On success: replaces `feed` state with real articles; updates `hero` if a good image is found
4. On failure: keeps mock data silently
5. Article clicks: if `article.url` exists, opens in new tab; otherwise opens internal article view

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

No install needed. Serve the files over HTTP:

```powershell
cd a:\hadaf
Start-Process python -ArgumentList "-m http.server 8000" -WindowStyle Hidden
Start-Process "http://localhost:8000"
```

Then open:
- `http://localhost:8000` — the live website (entry point is `index.html` at root)
- `http://localhost:8000/design-system.html` — the design system showcase
- `http://localhost:8000/preview/01-logo.html` — individual preview cards

**Why not just open the HTML file directly?** Babel's runtime JSX compilation requires HTTP (not `file://`) to load modules correctly. Always use a local server.

**API key for live scores:** Add your API-Football key to `site/config.js`:
```js
window.HADAF_CONFIG = { API_FOOTBALL_KEY: 'your-key-here' };
```
Get a free key at https://dashboard.api-football.com

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
| Scores API CORS | High | API-Football free tier may block browser requests — switch to football-data.org or add a proxy |
| Article images from RSS | Medium | Guardian/BBC RSS rarely includes images — pull from `<meta og:image>` via proxy |
| Mobile responsiveness | Medium | Nav and cards need breakpoint polish for small screens |
| Arabic news sources | Medium | Al Jazeera Sport + Sky Arabia RSS feeds for native Arabic content |
| WCAG contrast audit | Medium | All 3 themes need AA contrast check |
| Page title + favicon | Low | Generic browser tab title currently |
| Update 24 preview pages | Low | Add theme switcher + correct token link to each |
| Replace Babel runtime | Low | Use Vite or Next.js when team grows — current runtime compile is slow on cold load |
| Ad slot activation | Future | `AdSlot` in `Bits.jsx` — hidden until monetization |
| Real article routing | Future | Article page is a view in `App.jsx` — needs real URL routing |

---

## 15. Conventions for AI Assistants

If you are an AI assistant working on this codebase, follow these rules:

1. **Always use design tokens** from `colors_and_type.css` — never hardcode hex values in CSS
2. **Theme-aware by default** — any new CSS rule that sets a color MUST work across all 3 themes
3. **RTL-first** — test layouts in Arabic (`dir="rtl"`) before checking English
4. **No emoji in UI** — use Lucide SVG icons or custom SVGs from `assets/icons/sport/`
5. **No colored card borders** — explicitly banned by the design system
6. **No decorative gradients** — only allowed gradient is the hero photo scrim (`--protect-grad`)
7. **BEM naming** — new CSS classes follow `.hd-[block]-[element].is-[state]` pattern
8. **Keep components in their files** — don’t add JSX to `index.html` directly
9. **Mock data stays in App.jsx** — components receive data as props; never fetch inside components except `HomeView` and `ScoresView`
10. **Short git commit messages** — keep under 72 chars
11. **API errors must surface** — never use `.catch(() => {})` silently; always log with `console.warn` or `console.error`
12. **Proxy chain for RSS** — `newsApi.js` tries 3 proxies in sequence; if adding a new feed, test it with `HadafNews.getFeedArticles('key')` in the browser console first
13. **Config key is empty on GitHub Pages** — never commit a real API key; scores page must gracefully handle an empty key
14. **Entry point is `index.html` at root** — not `site/index.html`. All new `<script>` tags go in root `index.html` in correct load order: React → Babel → components → APIs → App
