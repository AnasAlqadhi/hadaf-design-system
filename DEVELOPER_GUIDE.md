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
| **Branch** | `main` (GitHub Actions deploys to GitHub Pages) |
| **Current version** | v0.9 |

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
│   ├── styles.css              ← All component CSS (~1400 lines)
│   ├── App.jsx                 ← Root component: routing, theme state, data
│   ├── Nav.jsx                 ← Top navigation bar + theme switcher + mobile hamburger
│   ├── Hero.jsx                ← Full-bleed hero section
│   ├── MatchCard.jsx           ← Individual match score card
│   ├── ArticleCard.jsx         ← News article preview card (opens external URLs in new tab)
│   ├── LeagueTable.jsx         ← Standings table (full + compact modes)
│   ├── Bits.jsx                ← Small shared components: LiveTicker, AdSlot, Footer
│   ├── api.js                  ← API-Football v3 wrapper (fallback sports data)
│   ├── sportmonksApi.js        ← Sportmonks v3 wrapper (primary sports data)
│   ├── newsApi.js              ← RSS news feed fetcher (multi-proxy CORS chain)
│   ├── config.js               ← LOCAL ONLY — gitignored, holds real API keys
│   └── config.example.js       ← Safe blank template committed to git
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
- **Data:** Static mock constants (`ARTICLES`, `MOCK_LIVE`, `FEED_MOCK`, `STANDINGS`) used as initial state; `HomeView` fetches real RSS news on mount and on language change
- **Error handling:** `ErrorBoundary` class wraps the entire render tree
- **Routes:** `home` | `scores` | `league` | `article` | `ucl` | `wc` | `video`
- **Hero click:** Opens external URL in new tab when `hero.url` is set; otherwise opens internal `ArticleView`
- **Sidebar matches (`SidebarMatches`):** Fetches today's fixtures from Sportmonks on mount; falls back to `MOCK_LIVE`

### `Nav.jsx`
- **Role:** Sticky top navigation + mobile hamburger drawer
- **Props:** `lang`, `setLang`, `theme`, `setTheme`, `route`, `setRoute`
- **Logo:** `<img src="assets/logo/hadaf-wordmark.png">` at 42px height (inverted on dark themes)
- **Nav items:** Home, Scores (النتائج), Saudi, UCL, World Cup, Video
- **CSS class:** `.hd-nav` (glassmorphic, `backdrop-filter: blur(16px)`)
- **Mobile:** `.hd-hamburger` button, `.hd-mobile-menu` slide-down drawer below 900px

### `Hero.jsx`
- **Role:** Full-bleed hero section for lead story
- **Props:** `kicker`, `title`, `image`, `lang`, `onClick`

### `MatchCard.jsx`
- **Role:** Shows one match score
- **Props:** `home`, `away`, `scoreHome`, `scoreAway`, `status`, `minute`, `lang`, `compact`
- **Live state:** `.is-live` class → red left-border + pulsing clock

### `ArticleCard.jsx`
- **Role:** Article preview card (3 variants)
- **Props:** `kicker`, `title`, `image`, `time`, `readMin`, `lang`, `variant`, `url`, `onClick`
- **Variants:** `feature` (large), `standard` (medium), `compact` (list row)
- **External links:** When `url` prop is set, the card renders as `<a href target="_blank" rel="noopener noreferrer">` (SEO + security best practice)

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

### `ScoresView.jsx`
- **Role:** Full scores page — date strip + competition blocks + match rows
- **Components:** `DateStrip` (Yesterday/Today/Tomorrow tabs), `CompetitionBlock` (collapsible with league logo), `MatchRow`
- **Data priority:** Sportmonks first → API-Football fallback → empty state
- **Export:** `window.HdScoresView`

---

## 8. CSS Architecture (`site/styles.css`)

### Naming convention

BEM-inspired with `hd-` prefix:

```
.hd-[block]              → component root
.hd-[block]-[element]    → child element
.hd-[block].is-[state]   → state modifier
```

### Rules

- **No hardcoded colors** — always `var(--token-name)`
- **No `!important`** unless overriding third-party styles
- **All transitions** use `var(--dur-base)` and `var(--ease-out)` unless intentionally different

---

## 9. API Architecture

### `site/config.js` — API key storage (gitignored)

**Never committed to git.** Holds real keys only on your local machine and on GitHub Pages (injected by GitHub Actions).

```js
// site/config.js — LOCAL ONLY, gitignored
window.HADAF_CONFIG = {
  API_FOOTBALL_KEY: 'your-api-football-key-here',
  SPORTMONKS_KEY:   'your-sportmonks-key-here',
};
```

Copy `site/config.example.js` to `site/config.js` and fill in your keys for local development.

### `site/sportmonksApi.js` — Sportmonks v3 (primary)

- **Base URL:** `https://api.sportmonks.com/v3/football`
- **Auth:** Bearer token via `Authorization` header
- **Key:** `window.HADAF_CONFIG.SPORTMONKS_KEY`
- **Free-tier leagues (confirmed):** Premier League (8), Bundesliga (82), La Liga (564), AFC Champions League Elite (1085), Saudi Reserve League (3225)
- **Needs adding in Sportmonks dashboard:** Saudi Pro League (1452), UEFA Champions League (2)
- **Functions:** `getSmFixturesByDate(dateStr)`, `getSmLiveFixtures()`
- **Returns:** Normalised fixture blocks sorted by league priority
- **Export:** `window.HadafSportmonks`

### `site/api.js` — API-Football v3 (fallback)

- **Base URL:** `https://v3.football.api-sports.io`
- **Auth:** `x-apisports-key` header; key passed as query param when using CORS proxy
- **Key:** `window.HADAF_CONFIG.API_FOOTBALL_KEY`
- **CORS chain:** direct → corsproxy.io → codetabs.com (10s timeouts)
- **Leagues:** saudi(307), ucl(2), premier(39), laliga(140), seriea(135), bundesliga(78), season 2025
- **Functions:** `getFixturesByDate(dateStr)`, `getLiveFixtures()`, `getStandings(leagueKey)`
- **Export:** `window.HadafAPI`

### `site/newsApi.js` — RSS news (no auth)

- **Method:** Fetches RSS XML via CORS proxy chain (codetabs → corsproxy.io → thingproxy), parsed with browser `DOMParser`
- **Feeds:**
  | Key | Source | Language |
  |---|---|---|
  | `sky_en` | Sky Sports Football RSS | English |
  | `espn` | ESPN Soccer RSS | English |
  | `bbc_ar` | BBC Arabic Sport RSS | Arabic |
  | `aljazeera_ar` | Al Jazeera Sport RSS | Arabic |
  | `russia_today_ar` | RT Arabic Sport RSS | Arabic |
- **Functions:** `getFeedArticles(feedKey, count)`, `getLatestNews(feedKeys, count)`, `getFeedKeysForLang(lang)`
- **Export:** `window.HadafNews`
- **To add a new feed:** Add an entry to the `NEWS_FEEDS` object with `{ url, lang }`.

### Data flow: Home page articles

1. `HomeView` renders with mock `FEED_MOCK` + `ARTICLES.hero` immediately
2. On mount (and on language change), calls `HadafNews.getLatestNews(keys, 12)` — 12 articles
3. RSS articles: mapped to `{ kicker, title, image, time, readMin, url, excerpt }`
4. `relativeTime()` formats pub dates as "2h ago" / "قبل ساعتين" etc.
5. Local image pool (`LOCAL_IMAGES`) fills in when RSS provides no image
6. Hero is set to first article with a real remote image
7. Article clicks: `url` present → open in new tab; no `url` → internal `ArticleView`

---

## 10. GitHub Actions Deployment

### Workflow: `.github/workflows/deploy.yml`

Triggers on:
- Push to `main`
- Schedule: every 6 hours (keeps scores/articles fresh)
- Manual dispatch (GitHub Actions tab → "Run workflow")

**What it does:**
1. Checks out the repo
2. Generates `site/config.js` from GitHub Secrets (so keys are never stored in git)
3. Uploads the whole repo root as a GitHub Pages artifact
4. Deploys to GitHub Pages via the official `actions/deploy-pages` action

### One-time setup required (GitHub web UI)

**Step 1 — Switch Pages source to "GitHub Actions":**
> Repo → Settings → Pages → Source → select **"GitHub Actions"** (not "Deploy from branch")

**Step 2 — Add secrets:**
> Repo → Settings → Secrets and variables → Actions → New repository secret

| Secret name | Value |
|---|---|
| `SPORTMONKS_KEY` | Your Sportmonks API key |
| `API_FOOTBALL_KEY` | Your API-Football key |

Once done, every push to `main` will automatically deploy with both API keys injected.

---

## 11. Design System Showcase (`design-system.html`)

Standalone HTML page — does **not** use React. Pure HTML + CSS + vanilla JS.

- Imports `colors_and_type.css` for all tokens
- Has a fixed-position theme switcher that writes `data-theme` to `<html>`
- 24 component cards organized in 4 sections: Brand, Color, Typography, Components

---

## 12. How to Run Locally

No install needed. Serve the files over HTTP:

```powershell
cd a:\hadaf
python -m http.server 8000
```

Then open:
- `http://localhost:8000` — the live website
- `http://localhost:8000/design-system.html` — the design system showcase

**API key setup for local development:**

```powershell
Copy-Item site\config.example.js site\config.js
# Now edit site\config.js and fill in your real keys
```

**Why not open HTML directly?** Babel's runtime JSX compilation requires HTTP (not `file://`). Always use a local server.

---

## 13. How to Deploy

```powershell
cd a:\hadaf
git add -A
git commit -m "feat: short description"
git push
```

GitHub Actions picks up the push, injects API keys from secrets, and publishes to GitHub Pages within ~1–2 minutes. No manual deploy step needed.

**Manual deploy (without push):** Go to GitHub repo → Actions → "Deploy Hadaf to GitHub Pages" → "Run workflow".


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
