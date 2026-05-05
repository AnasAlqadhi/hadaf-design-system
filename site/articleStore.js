// -------------------------------------------------------
// Hadaf — Article store
// Loads admin-curated overrides (data/articles.json) and
// applies them to the merged RSS feed.
//
// Schema of data/articles.json:
// {
//   version: 1,
//   updated: ISO date,
//   custom: [ { id, title:{ar,en}, kicker:{ar,en}, image, body:{ar,en},
//               pubDate, featured?, hidden? } ],
//   rules: {
//     hidden_urls:   [ ...URLs to omit from the feed ],
//     featured_urls: [ ...URLs to pin to the top of the feed ],
//     hero_urls:     [ ...URLs to use as hero carousel slides ]
//   }
// }
// -------------------------------------------------------

const ARTICLES_PATH = 'data/articles.json';
const EMPTY_OVERRIDES = {
  version: 1,
  updated: new Date().toISOString(),
  custom: [],
  rules: { hidden_urls: [], featured_urls: [], hero_urls: [] },
};

let _overrides = null; // cached in-memory after first load
let _loadPromise = null;

async function loadOverrides() {
  if (_overrides) return _overrides;
  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    try {
      // bust caches so admin sees their own changes after publish
      const res = await fetch(`${ARTICLES_PATH}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      _overrides = normalizeOverrides(data);
    } catch (e) {
      console.warn('[hadaf:articleStore] no admin overrides, using empty:', e.message);
      _overrides = { ...EMPTY_OVERRIDES };
    }
    return _overrides;
  })();
  return _loadPromise;
}

function normalizeOverrides(o) {
  o = o || {};
  o.custom = Array.isArray(o.custom) ? o.custom : [];
  o.rules = o.rules || {};
  o.rules.hidden_urls   = Array.isArray(o.rules.hidden_urls)   ? o.rules.hidden_urls   : [];
  o.rules.featured_urls = Array.isArray(o.rules.featured_urls) ? o.rules.featured_urls : [];
  o.rules.hero_urls     = Array.isArray(o.rules.hero_urls)     ? o.rules.hero_urls     : [];
  return o;
}

// Keep in-memory overrides in sync with admin edits (no full reload needed)
function setOverrides(next) {
  _overrides = normalizeOverrides(next);
  return _overrides;
}

// Convert a custom article (admin-written) into the same shape the feed uses
function customToFeedItem(c) {
  return {
    id:      c.id,
    title:   c.title || { ar: '', en: '' },
    kicker:  c.kicker || { ar: 'هدف', en: 'Hadaf' },
    excerpt: c.excerpt || { ar: '', en: '' },
    image:   c.image || '',
    url:     null,                    // custom articles open in-app, not external
    pubDate: c.pubDate || new Date().toISOString(),
    source:  c.kicker || { ar: 'هدف', en: 'Hadaf' },
    body:    c.body || null,
    custom:  true,
    featured: !!c.featured,
  };
}

/**
 * Apply admin overrides to a list of RSS-derived articles.
 * Returns { feed, hero } where:
 *   - feed: list of articles to render (hidden removed, custom merged, featured first)
 *   - hero: optional list of articles to override the hero carousel
 */
function applyOverrides(rssArticles, overrides) {
  overrides = overrides || EMPTY_OVERRIDES;
  const hidden = new Set(overrides.rules.hidden_urls);
  const featured = new Set(overrides.rules.featured_urls);
  const heroUrls = new Set(overrides.rules.hero_urls);

  // 1. Filter out hidden URLs
  const visible = rssArticles.filter(a => !hidden.has(a.url));

  // 2. Merge custom articles in. Custom-with-featured come first, then RSS-featured,
  //    then custom-non-featured, then everything else (newest first within each group).
  const customs = (overrides.custom || []).map(customToFeedItem);
  const customFeatured = customs.filter(c => c.featured);
  const customRest     = customs.filter(c => !c.featured);

  const rssFeatured = visible.filter(a => featured.has(a.url));
  const rssRest     = visible.filter(a => !featured.has(a.url));

  const merged = [
    ...customFeatured,
    ...rssFeatured,
    ...customRest,
    ...rssRest,
  ];

  // 3. Build hero list from explicitly hero'd URLs, preserving order in the rules
  const allByUrl = new Map();
  for (const a of [...customs, ...rssArticles]) if (a.url) allByUrl.set(a.url, a);
  const hero = overrides.rules.hero_urls
    .map(u => allByUrl.get(u))
    .filter(Boolean);

  return { feed: merged, hero };
}

window.HadafArticleStore = {
  loadOverrides,
  setOverrides,
  applyOverrides,
  ARTICLES_PATH,
};
