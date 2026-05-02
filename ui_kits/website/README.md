# Hadaf Website — UI Kit

Interactive demo of the public-facing Hadaf football news website. Open `index.html` to navigate between Home, League page, and Article view.

## Components
- `Nav.jsx` — sticky top nav with logo, primary nav, language toggle, search.
- `Hero.jsx` — full-bleed hero with photo, kicker, headline.
- `MatchCard.jsx` — score card with live/final states and crests.
- `ArticleCard.jsx` — feature, standard, and compact article cards.
- `LeagueTable.jsx` — standings table with form indicators.
- `LiveTicker.jsx` — horizontal ticker of live & upcoming matches.
- `AdSlot.jsx` — placeholder ad slot (currently dotted, hidden in production until enabled).
- `Footer.jsx` — site footer.
- `App.jsx` — routes between three screens.

All components are RTL-first. Set `dir="ltr"` and `lang="en"` on `<html>` to render the LTR/English variant.
