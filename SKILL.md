---
name: hadaf-design
description: Use this skill to generate well-branded interfaces and assets for Hadaf (هدف), an Arabic-first football news brand covering the Saudi Pro League, top European leagues, the Champions League, and the World Cup. Use for production work or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Hadaf is **Arabic-first (RTL)** with English as a secondary language. Default to `dir="rtl" lang="ar"` unless the user requests English, and always test that designs work both ways. The brand voice is **hype and passionate** in a fan's voice — never wire-service neutral, never clickbait.

Key files:
- `colors_and_type.css` — all design tokens (Hadaf green, championship gold, ink/paper neutrals, type families, spacing, radii, shadows)
- `assets/logo/` — wordmark + mark, light + dark
- `assets/icons/sport/` — sport-specific custom icons; pair with Lucide for general UI
- `assets/crests/` — placeholder team crests (Saudi Pro League four)
- `assets/imagery/` — placeholder match photography
- `assets/patterns/star-tile.svg` — 8-point star tessellation, use at 4–8% opacity
- `site/` — the live website and canonical component source (Nav, Hero carousel, MatchCard, ArticleCard, LeagueTable, plus Bits: LiveTicker, BreakingBar, MostRead, MatchDayCard, SkeletonCard, AdSlot, Footer, DataStatus)
- `ui_kits/website/` — frozen legacy snapshot, do not use for new work
- `preview/` — small spec cards for individual tokens/components

Avoid: emoji, bluish-purple gradients, decorative gradients, colored left-border accent cards, Inter/Roboto fallbacks for headlines (use Cairo/Bebas Neue).
