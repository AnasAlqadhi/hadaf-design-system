# Hadaf (هدف) — Design System

> **Hadaf** (هدف) means *"goal"* in Arabic — punchy, direct, and instantly recognizable to any Arab football fan. The brand serves Arabic-speaking football audiences with passionate, hype coverage of the Saudi Pro League, top European leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1), the Champions League, and the World Cup — plus star coverage (Messi, Ronaldo, Saudi-based stars, etc).

## Context

- **Product:** Football news website, Arabic-first (RTL), with English as a secondary language. Public-facing news + reading experience for now; admin/editorial tooling and monetization (ads) will come later, but layouts must reserve space for them.
- **Audience:** Arabic-speaking football fans across the Gulf, Levant, Egypt, and Maghreb. Saudi League is a focus, but European competitions and global stars matter just as much.
- **Tone:** Hype & passionate — written in a fan's voice. See `CONTENT_FUNDAMENTALS` below.
- **Visual vibe:** Local & cultural — Arabic typographic heritage and geometric patterns, married to the energy of modern sports media.

## Sources / inputs

This system was built from scratch — no codebase, Figma, or existing brand assets were attached. Everything here is a **proposal**: colors, type, components, and screens. Iterate freely, and replace placeholder match photos with real licensed imagery before launch.

If you have any of the following, drop them in and I'll align the system to them:
- Existing logo or wordmark
- Brand colors / hex codes you've already chosen
- Reference sites you love (Kooora, Yallakora, BeIN, The Athletic, etc.)
- Any sample articles or editorial copy you've written

## Index

| File | What's in it |
|---|---|
| `README.md` | This file — context, content + visual foundations, iconography, manifest |
| `SKILL.md` | Skill manifest for invoking this system from Claude/Claude Code |
| `colors_and_type.css` | All design tokens: colors, type scale, spacing, radii, shadows |
| `fonts/` | Webfont files (or links to Google Fonts substitutes) |
| `assets/` | Logos, icons, illustrations, placeholder imagery |
| `preview/` | Design-system preview cards (registered, shown in Design System tab) |
| `ui_kits/website/` | Website UI kit — JSX components + interactive `index.html` demo |

---

## CONTENT FUNDAMENTALS

Hadaf writes like a knowledgeable fan in a majlis with friends — not a wire-service reporter. The voice is **hype, passionate, opinionated, and deeply informed**, but it never crosses into clickbait or disrespect.

### Voice & tone

- **Hype, not hyperbole.** "ليلة لا تُنسى لرونالدو" ("An unforgettable night for Ronaldo") — yes. "أعظم مباراة في التاريخ!!!" ("Greatest match in history!!!") — no.
- **Fan-first, not detached.** Write *with* the fan, not above them. Use "نحن" (we) sparingly but warmly when talking about Arab/Saudi football.
- **Confident takes.** Hadaf has opinions. Headlines lean editorial: "لماذا فشل الهلال أمام النصر" ("Why Al-Hilal failed against Al-Nassr") rather than a flat "Al-Hilal lose to Al-Nassr".
- **Respect the game.** No mocking, no personal attacks on players, no sectarian/political angles.

### Casing & punctuation

- **Arabic:** No capitalization concept — but headlines stay tight and verb-led. Avoid English-style title case patterns.
- **English (secondary):** Sentence case for body and UI labels. Title Case is reserved for navigation and section headers ("Latest News", "Saudi League").
- **Numbers:** Use Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) in Arabic body copy; Western (0123456789) in English. Scores are always Western for clarity (`2-1`, not `٢-١`).
- **Punctuation:** Use Arabic comma `،` and Arabic question mark `؟` in Arabic content.

### Person

- **You / أنت** when speaking *to* the reader (CTAs, prompts: "تابع المباراة" / "Follow the match").
- **We / نحن** sparingly, for editorial "we" or for community ("منتخبنا" — *our national team* — is fine in match coverage).
- **Avoid first-person "I"** in news copy.

### Sample copy

| Context | Arabic | English |
|---|---|---|
| Hero headline | **ليلة تاريخية في الرياض: الهلال يكتسح في الديربي** | A historic night in Riyadh: Al-Hilal dominate the derby |
| Article kicker | عاجل | Breaking |
| CTA | تابع كل المباريات | Follow every match |
| Section label | أبرز الأخبار | Top stories |
| Live indicator | مباشر | LIVE |
| Empty state | لا توجد مباريات اليوم. عُد غدًا. | No matches today. Come back tomorrow. |

### Emoji & symbols

- **No emoji** in headlines, body, or UI. The brand voice carries the energy on its own — emoji cheapens it.
- **Use real iconography** (see Iconography section) for status indicators, never `🔴` or `⚽`.
- **Exception:** social share cards may use sport-related emoji if platform conventions demand it, but never in the product itself.

---

## VISUAL FOUNDATIONS

### Motif

Hadaf's visual identity rests on three pillars:

1. **Arabic typographic heritage.** Big, confident Arabic display type does the heavy lifting. Headlines are the hero — not photos, not gradients.
2. **Geometric Islamic patterning.** Subtle 8-point star and tessellated motifs appear as section dividers, card backgrounds at low opacity, and decorative accents in section headers. Never as full-screen backgrounds — always restrained.
3. **Stadium energy.** High-contrast black & white photography with a single hot accent color. Think floodlit-pitch-at-night, not daytime-grass.

### Color

See `colors_and_type.css` for tokens. Summary:

- **Primary:** `--hadaf-green` (`#0E5C3A`) — a deep stadium green, evocative of Saudi national identity and the pitch itself. Confident, premium, not loud.
- **Accent:** `--hadaf-gold` (`#D4A437`) — championship gold. Used sparingly for live indicators, scores, and key CTAs.
- **Neutrals:** A near-black `--ink` (`#0B0F0D`) and warm off-whites `--paper` (`#FAF7F1`) — Arabic-newspaper inspired, never pure `#FFF` or pure `#000`.
- **Semantic:** Red for live/breaking (`--live-red` `#E03131`), blue for stats/links inside articles.

### Type

- **Arabic display:** **Cairo** (Google Fonts) — geometric, modern, headline-strong. Used at 800 weight for hero headlines.
- **Arabic body:** **IBM Plex Sans Arabic** (Google Fonts) — clean, readable, pairs well with Cairo.
- **Latin display:** **Bebas Neue** (Google Fonts) — condensed, sport-magazine energy for English headlines and scores.
- **Latin body:** **Inter** (Google Fonts).
- **Numerals:** **JetBrains Mono** for scores, stats tables, match clocks — fixed-width, unambiguous.

> **Substitution flag:** All fonts above are Google Fonts substitutions (no proprietary fonts were provided). If you license a brand-specific Arabic display face later, swap Cairo for it in `colors_and_type.css`.

### Spacing

A 4px base grid. Tokens: `--sp-1` (4px) through `--sp-12` (96px). Most components snap to multiples of 8px; tight UI (badges, chips) uses 4px increments.

### Backgrounds

- **Primary surface:** `--paper` (warm off-white) for reading; `--ink` (deep near-black) for hero blocks and dark-mode-style sections.
- **Imagery:** Full-bleed, edge-to-edge match photography is the dominant background pattern in heroes and feature cards. Photos lean **cool, slightly desaturated, with deep shadows** — stadium-at-night feel. A subtle dark gradient (`--protect-grad`) sits over photos to guarantee headline legibility.
- **Patterns:** A repeating 8-point star tessellation lives at `--pattern-opacity` (typically 4–6% on `--ink`, 6–8% on `--paper`). Used as a section background or card backing — never as a full-page background.
- **No bluish-purple gradients.** Never. Backgrounds are either solid, photographic, or patterned.

### Animation

- **Easing:** `--ease-out` (`cubic-bezier(0.2, 0.8, 0.2, 1)`) for entrances; `--ease-in-out` for state changes. No bouncy springs.
- **Durations:** `--dur-fast` 150ms (hovers), `--dur-base` 240ms (most transitions), `--dur-slow` 400ms (page-level fades).
- **Score updates:** brief 200ms scale-flash on number change (1.0 → 1.06 → 1.0).
- **Live pulse:** the `LIVE` indicator pulses opacity 1 → 0.5 → 1 over 1.6s, infinite.
- **Page entrances:** subtle fade + 8px translateY. Never slide from off-screen, never bounce.

### Hover & press

- **Hover (links/buttons):** background darkens by ~8% (use `color-mix(in oklab, <c> 92%, black)`), or for ghost buttons, background fills to 6% tint of primary.
- **Hover (cards):** lift via shadow change (`--shadow-1` → `--shadow-2`) + 1px upward translate. No scale.
- **Press:** translate down 1px, shadow shrinks to `--shadow-0`. No color shift.
- **Focus:** 2px outline in `--hadaf-gold` at 2px offset. Always visible, never `outline: none`.

### Borders & dividers

- Hairlines are `1px solid var(--border)` (`#E6E1D7` on paper, `#1F2622` on ink).
- Heavy section dividers use a 4px gold or green bar, not a long thin line.
- Cards: 1px border + `--shadow-1`. No double-borders.

### Shadows / elevation

Three levels — see `colors_and_type.css`. Shadows are warm (slight green-black tint), never neutral grey:
- `--shadow-0`: barely-there, for resting cards on paper
- `--shadow-1`: standard card lift
- `--shadow-2`: hover/active state, modals

### Capsules vs gradients

Hadaf prefers **solid capsules** (pill-shaped tags, score chips) to gradient buttons. The only protection gradient is the dark-to-transparent overlay on hero photography (`--protect-grad`). Gradients are never decorative.

### Transparency & blur

- **Backdrop blur** (`backdrop-filter: blur(16px)`) used sparingly — sticky nav over content, modal scrims.
- **Card transparency:** never. Cards are always solid `--paper` or `--surface-2`.
- **Image scrims:** dark gradient on photos for headline contrast — opacity 0 at top → 0.7 at bottom.

### Imagery vibe

Match photography is the soul of the product. Treatment guidelines:
- **Cool, slightly desaturated** — saturate(0.92) by default
- **Deep shadows preserved** — never crush blacks to grey
- **Slight warm-grain** acceptable on featured editorial photos
- **No B&W** unless intentional editorial choice (e.g. obituary, retrospective)
- Always full-bleed at hero scale; cards crop tight on faces and ball-action

### Corner radii

- `--radius-sm` 4px — chips, tags, small inputs
- `--radius-md` 8px — buttons, form inputs, score boxes
- `--radius-lg` 12px — cards
- `--radius-xl` 20px — feature cards, hero blocks
- `--radius-full` 999px — avatar, pills, live indicator
- No 4xl radii. The brand is sharp, not pillowy.

### Cards

- 1px hairline border (`--border`)
- `--shadow-1` at rest, `--shadow-2` on hover
- `--radius-lg` (12px) standard, `--radius-xl` for hero/feature
- White (`--paper`) or dark (`--surface-2`) fills only — never tinted
- No colored left-border accents (a tired AI trope — banned in this system)

### Layout rules

- Max content width: 1280px, centered, with 24px gutters on desktop, 16px on mobile.
- Sticky top nav (64px tall on desktop, 56px mobile) with `backdrop-filter: blur(16px)` and `--paper` at 80% alpha.
- Hero is always full-bleed (edge-to-edge), even when content above/below is gutter-constrained.
- 12-column grid on desktop; 4-column on mobile.
- **RTL is the primary direction.** All components must work both ways. Layout mirrors automatically via `dir="rtl"` on `<html>`.
- Reserve a 300×250 ad slot in the right rail (or left rail in RTL) on article and league pages — currently empty / labeled "AD" with a dotted border, hidden from the live build until monetization is enabled.

---

## ICONOGRAPHY

Hadaf uses **Lucide** (open-source, MIT) as its icon system, linked from CDN. Icons are line-style, 1.75px stroke, rounded caps. The set is comprehensive enough to cover navigation, actions, and status indicators without cluttering the brand with a custom icon font.

- **Stroke width:** 1.75 (medium-bold to read at small sizes alongside Arabic type, which has stronger weight presence).
- **Icon sizes:** 16px (inline), 20px (UI default), 24px (nav), 32px (feature).
- **Color:** inherits `currentColor`. No multi-color icons.
- **No emoji as icons.** Ever. See Content Fundamentals.
- **No unicode symbols** for status (`●`, `►`, etc.) — use proper SVG icons.

For sport-specific things Lucide doesn't cover (e.g. football pitch, jersey, whistle), small custom SVGs live in `assets/icons/sport/`. They're drawn in the same line-style at 1.75px stroke for visual consistency.

**Substitution flag:** Lucide is a general-purpose icon set — not football-specific. If you later license or commission a custom sport-icon set, drop it in `assets/icons/` and update this section.

---

## Manifest

```
README.md                    ← you are here
SKILL.md                     ← skill manifest for Claude / Claude Code
colors_and_type.css          ← design tokens (colors, type, spacing, radii, shadows)
assets/
  logo/                      ← wordmark light + dark, mark
  icons/sport/               ← ball, pitch, jersey, whistle, trophy-shield
  crests/                    ← team-blue, team-yellow, team-black, team-red (placeholders)
  imagery/                   ← match-action-1, stadium-crowd, player-portrait (placeholders)
  patterns/                  ← star-tile.svg (8-pt geometric pattern)
preview/                     ← 24 spec cards: type, colors, spacing, components, brand
ui_kits/
  website/                   ← interactive Hadaf news website
    index.html               ← entry — Home, League, Article (RTL/LTR toggle)
    Nav.jsx, Hero.jsx, MatchCard.jsx, ArticleCard.jsx,
    LeagueTable.jsx, Bits.jsx (LiveTicker, AdSlot, Footer), App.jsx
    styles.css
```

## Iteration

This system is a strong starting proposal. The next round should:
1. Confirm the color palette (especially the green — Saudi-green vs. pitch-green is a real choice).
2. Replace the placeholder match photography with real licensed imagery.
3. Sketch a logo / wordmark for **هدف** — currently the system uses a typeset wordmark only.
4. Validate the Arabic display font choice (Cairo) against your editorial preference.


## Version History

### v0.3 — Full Stack Premium Overhaul (Current)

**Live site:** https://anasalqadhi.github.io/hadaf-design-system/
**GitHub:** https://github.com/AnasAlqadhi/hadaf-design-system

**Focus:** Complete visual redesign, 3-mode theme system, React component polish, and public GitHub Pages deployment.

**Key additions:**
- **Three-theme system:** Default (warm light), Dark (modern dark), Match-Night (high-contrast stadium atmosphere)
- **5-level shadow hierarchy:** --shadow-0 through --shadow-4 with warm green-tinted falloff
- **Animation token system:** --dur-fast (120ms) / --dur-base (200ms) / --dur-slow (350ms) / --dur-slower (500ms) + easing curves
- **Hero component rebuild:** Full-bleed image, dual scrim, star overlay, pulse-dot kicker pill, gold CTA, hero-footer stats row
- **Glassmorphic navigation:** Sticky nav with backdrop-filter blur and paper at 80% alpha
- **Live Ticker:** Dark bar, sticky label, glass chips, hidden scrollbar
- **Compact League Table:** New compact prop — 3-column sidebar mode (rank, team, pts)
- **Live match state:** .is-live class applies red left-border glow on match cards
- **SVG theme icons:** Replaced emoji buttons with inline SVG sun/moon/fire icons + aria-pressed
- **Theme persistence:** localStorage key hadaf-theme; survives page reload
- **Design System page:** 24 component cards fully rebuilt; working JS theme switcher
- **GitHub Pages deployment:** Site is live and publicly accessible

**Files changed:**
- colors_and_type.css — 3 complete theme variable blocks, animation tokens, 5-level shadows
- site/styles.css — ~1000 lines, full component coverage across all 3 themes
- site/App.jsx — theme useState + localStorage + compact league table in aside
- site/Nav.jsx — SVG Icon components, aria-pressed, ThemeSwitcher
- site/Hero.jsx — complete rewrite with kicker, gold CTA, hero-footer
- site/MatchCard.jsx — is-live conditional class
- site/LeagueTable.jsx — compact prop, 3-col table mode
- design-system.html — deleted and recreated clean; 24 cards, working theme JS

**Git commits (on main):**
- 74253a3 — final premium push
- edecf1d — Complete design-system.html with working theme switcher
-  7c9db3 — feat: Add premium theme system with dark and match-night modes
- 8c20bb2 — initial commit

### v0.2 — Premium Theme System

- Three-theme CSS variable system introduced
- Enhanced shadow hierarchy and animation tokens
- React theme management with localStorage

### v0.1 — Foundation

Initial design system with brand colors, typography (bilingual), spacing grid, base components, and preview system.