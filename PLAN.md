# Hadaf (هدف) — Improvement Plan & Roadmap

> **Goal (your words):** *"Build a website for football news… I don't want to be always
> updating it, I'd like it to work aside."*
>
> This document is the single source of truth for **what is broken, why, and the
> prioritized plan to make Hadaf a genuinely autonomous, self-sustaining football news
> site.** Last full audit: **2026-06-16**.

---

## 0. The one big idea

"**Works aside**" is not one feature — it is three things that must all be true at once:

1. **The content engine actually produces content** — every few hours, automatically,
   with no human in the loop.
2. **The content is original Arabic** (not republished English headlines) — so it has
   value, is legal to publish, and is unique enough for Google to rank.
3. **The site pulls passive traffic** — i.e. it is discoverable in Google Search & Google
   News/Discover. A site nobody finds is not "working aside," it's just running aside.

Today, **all three are broken or missing.** Fixing them — in that order — is the plan.

---

## 1. Current state audit (2026-06-16)

### 1.1 What's working well ✅

- **Solid architecture & docs.** `DEVELOPER_GUIDE.md` is genuinely excellent. The token
  system, theming (3 themes), RTL-first design, and component split are clean.
- **The autopilot scaffold exists.** GitHub Actions runs every 6h, fetches RSS, and
  deploys to GitHub Pages with zero manual steps. The *plumbing* of "works aside" is real.
- **Good baseline SEO metadata.** `index.html` has OG tags, Twitter cards, canonical, and
  `WebSite` JSON-LD. The foundation is there.
- **Resilient data layer.** `cache.js` (TTL + stale-fallback + status chip) and the
  multi-proxy RSS/sports fetchers are well thought out.
- **A real CMS.** The hidden `#admin` editor publishes overrides via the GitHub API.

### 1.2 What's broken 🔴 (ranked by impact)

| # | Problem | Evidence | Impact |
|---|---------|----------|--------|
| **B1** | **AI rewrite is 100% dead.** Google **removed `gemini-2.0-flash` from the free tier** — every call returns `429 … free_tier_requests, limit: 0`. | Live `feed.json`: **0 / 80 rewritten**. Actions log shows 429 on every article. | **Fatal.** The whole product (Arabic news in Hadaf's voice) doesn't exist. Visitors see raw **English** headlines. |
| **B2** | **Filter leaks non-football sports.** "World Cup" matches the include-regex even when the sport is **cricket**. | Top live article = *"Rain delays toss as England face Ireland at Women's T20 World Cup"*. | Credibility killer on a football site. |
| **B3** | **No per-article indexable pages.** Articles open either an external link (new tab) or a client-rendered in-app view with **no unique URL**. | `index.html` is the only HTML entry; no `/article/...` routes. | **Near-zero organic traffic possible** → directly defeats "works aside." |
| **B4** | **Client-side Babel render.** JSX is compiled in the browser on every load. | `<script type="text/babel">` in `index.html`. | Slow first paint; crawlers see an empty `#root` until JS runs; bad Core Web Vitals. |
| **B5** | **Dead RSS source.** `ultrasport.com/feed/` returns 0 items every run. | Dry-run: `ultrasport: 0/0`. | Wasted fetch; fewer Arabic sources. |
| **B6** | **Republishing others' content.** Fallback articles store the source's **full English title + excerpt** verbatim and link out. | `buildFallback()` in pipeline. | Duplicate-content SEO penalty + copyright exposure. The AI rewrite is what makes this legal/original — so B1 also makes B6 worse. |

### 1.3 Hygiene issues (fixed 2026-06-16 ✅)

- **Local clone was 145 commits behind** origin (bot auto-commits). → Fast-forwarded.
- **No `.gitattributes`** → editor kept rewriting every file to CRLF, producing fake
  "whole file changed" diffs. → Added `.gitattributes` (LF) + renormalized; `node_modules`
  now gitignored.

### 1.4 Docs drift (low priority)

`DEVELOPER_GUIDE.md` lists feeds (Al Jazeera, RT, Goal.com) and a model ("Claude Haiku"
in the workflow comment) that **don't match the code** (actual: Sky, BBC AR, ESPN,
Guardian, ultrasport; model = Gemini). Sync after the engine is fixed.

---

## 2. North-star architecture (where we're going)

```
                 ┌─────────────────────────────────────────────┐
   every 3–6h →  │  GitHub Actions (free)                       │
                 │   1. Fetch RSS (EN + AR football sources)    │
                 │   2. Strict football filter                  │
                 │   3. Rewrite → original Arabic (Gemini 2.5)  │
                 │   4. Write data/feed.json                    │
                 │   5. ★ Generate static per-article HTML       │  ← NEW (SEO)
                 │   6. ★ Generate sitemap.xml + rss.xml         │  ← NEW (SEO)
                 │   7. Deploy to GitHub Pages                  │
                 └─────────────────────────────────────────────┘
                              │
            ┌─────────────────┼──────────────────────┐
            ▼                 ▼                       ▼
     Google indexes      Readers land on        Newsletter / social
   /article/<slug>.html  fast static pages      auto-posts (later)
   → passive traffic     → ad / newsletter $     → recurring traffic
```

The key upgrade vs. today: the pipeline stops being "fetch → JSON → SPA" and becomes
"fetch → rewrite → **publish real pages**." That's the difference between a dashboard and
a *publication*.

---

## 3. Phased roadmap

Each task: **Why → What → Effort** (S ≈ <1h, M ≈ half-day, L ≈ 1–2 days).

### Phase 0 — Hygiene ✅ DONE (2026-06-16)
- [x] Fast-forward local clone to origin.
- [x] Add `.gitattributes` (LF) + renormalize; gitignore `node_modules`.

### Phase 1 — Revive the autonomous engine 🔴 CRITICAL (in progress)
> Without this, nothing else matters. This is the heart of "works aside."

- [ ] **P1.1 — Switch Gemini model to a current free-tier one.** *(S)*
  `gemini-2.0-flash` has `limit: 0`. As of 2026 the free tier is **`gemini-2.5-flash`**
  (10 RPM / 250 req-day) and **`gemini-2.5-flash-lite`** (15 RPM / 1000 req-day). Switch to
  `gemini-2.5-flash` for quality; flash-lite is the fallback if quota bites.
- [ ] **P1.2 — Add retry + exponential backoff + model fallback.** *(S)* On `429`/`503`,
  wait and retry; if the primary model is exhausted, fall back to flash-lite. One bad run
  shouldn't blank the rewrite.
- [ ] **P1.3 — Bump throughput.** *(S)* With 250 req/day free, `MAX_NEW_PER_RUN=3` is far
  too timid. Raise to ~15 and shorten the inter-call delay. Backfill the 80 existing
  fallback articles over a few runs.
- [ ] **P1.4 — Make the model + cadence configurable via env** so it's tunable without
  code edits (`GEMINI_MODEL`, `MAX_NEW_PER_RUN`). *(S)*

### Phase 2 — Quality of the autonomous output 🟠 HIGH
> Make the engine's output trustworthy and genuinely Arabic-first.

- [ ] **P2.1 — Fix the football filter.** *(S)* Require an explicit football signal; make
  "world cup / كأس العالم" only count alongside a football term, and expand the exclude
  list (T20, ICC, NBA playoffs, Olympics-other, etc.). Add a dry-run assertion that known
  cricket/tennis headlines are rejected.
- [ ] **P2.2 — Replace the dead feed + add Arabic-native sources.** *(M)* Drop
  `ultrasport`. Add working Arabic football RSS (e.g. Goal Arabic, Al Jazeera Sport, BeIN,
  Yallakora/Kooora via any available feed). Arabic-native content reads well **even when
  the AI rewrite is rate-limited** — a second safety net.
- [ ] **P2.3 — Better fallback presentation.** *(S)* Until an article is rewritten, don't
  show a bare English headline as if it were ours. Tag it visually as "مصدر: …/Source", and
  prefer Arabic-source fallbacks on the home grid.
- [ ] **P2.4 — De-dupe near-identical stories** across sources (same transfer reported 4×).
  *(M)* Simple title-similarity check before rewrite to save quota and avoid repetition.

### Phase 3 — SEO & discoverability 🟠 HIGH (this is what makes it "work aside")
> The pipeline should **publish**, not just populate a dashboard.

- [ ] **P3.1 — Generate static per-article pages.** *(L)* New pipeline step emits
  `/article/<slug>.html` per rewritten article: server-rendered Arabic title + body in the
  HTML (not JS-injected), correct canonical, OG image, and `NewsArticle` JSON-LD. These are
  the pages Google actually ranks.
- [ ] **P3.2 — `sitemap.xml` + `robots.txt`.** *(S)* Pipeline regenerates `sitemap.xml`
  listing every article page on each run; add `robots.txt` pointing to it.
- [ ] **P3.3 — Publish an RSS/Atom feed of our own.** *(S)* `rss.xml` of Hadaf's rewritten
  Arabic articles → enables Google News, feed readers, and auto-syndication.
- [ ] **P3.4 — `NewsArticle` / `BreadcrumbList` structured data** on article pages. *(S)*
- [ ] **P3.5 — Submit to Google Search Console + Bing.** *(S, manual)* One-time: verify the
  domain, submit the sitemap. (I'll give you the exact steps.)

### Phase 4 — Performance & robustness 🟡 MEDIUM
- [ ] **P4.1 — Kill in-browser Babel.** *(L)* Add a tiny build step (esbuild/Vite) that
  pre-compiles JSX at deploy time. Keeps the no-framework simplicity but removes the
  ~1–2s cold-compile and the empty-`#root`-for-crawlers problem. (B4)
- [ ] **P4.2 — Use React production builds + pin/​self-host CDN deps.** *(S)* Currently
  loads `react.development.js` (slower, larger).
- [ ] **P4.3 — Image lazy-loading + width/height** to stop layout shift. *(S)*
- [ ] **P4.4 — Pipeline health alert.** *(S)* If a run rewrites 0 of N (like the last
  month), fail the job loudly / open an issue so silent breakage can't recur. (This is
  exactly what hid B1 for a month — "success" with 0 rewrites.)

### Phase 5 — Growth & monetization 🟢 LATER
- [ ] **P5.1 — Newsletter capture** (Buttondown wiring already stubbed). *(M)*
- [ ] **P5.2 — Auto-post to X/Telegram** on new article (closes the traffic loop). *(M)*
- [ ] **P5.3 — Activate ad slots** (AdSense/Ezoic) once there's organic traffic. *(M)*
- [ ] **P5.4 — Real transfers & standings data** sources. *(M)*

### Phase 6 — Polish 🟢 LATER
- [ ] **P6.1 — Sync `DEVELOPER_GUIDE.md`** with the actual feeds/model. *(S)*
- [ ] **P6.2 — WCAG AA contrast audit** of all 3 themes (esp. Match-Night). *(M)*
- [ ] **P6.3 — Custom domain** (better branding + SEO than `…github.io/hadaf-design-system`).
  *(S, manual)*

---

## 4. Recommended order of execution

1. **Phase 1** (engine) — *do now.* The site is publicly broken until this lands.
2. **Phase 2.1** (filter) — *do now, same batch.* Cricket on a football site is embarrassing.
3. **Phase 2.2–2.3** (sources + fallback) — next.
4. **Phase 3** (SEO pages + sitemap) — the big unlock for passive traffic.
5. **Phase 4.4** (health alert) — cheap insurance so it never silently dies again.
6. Everything else as time allows.

---

## 5. Status log

| Date | Change |
|------|--------|
| 2026-06-16 | Full audit. Root-caused dead pipeline (Gemini free-tier removal of 2.0-flash). Phase 0 hygiene done. Plan written. |
| 2026-06-16 | **Phase 1 done** (P1.1–P1.4): model → `gemini-2.5-flash` (+ flash-lite fallback), retry/backoff, throughput 3→15, env-configurable. **Phase 2 partial**: P2.1 filter hardened (9/9 unit tests; cricket/tennis/NBA rejected), P2.2 dead `ultrasport` feed replaced with RT Arabic Sport (17 football articles/run). **P4.4 done**: pipeline now hard-fails on 0-of-N rewrites so silent breakage can't recur. Verified via dry-run; live Gemini call pending deploy. |

*(Append future changes here so this file stays the source of truth.)*
