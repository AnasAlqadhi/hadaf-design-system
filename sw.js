// Hadaf Service Worker — offline shell strategy
// Caches the app shell on install; serves from cache, updates in background.

const CACHE_NAME = 'hadaf-shell-v1';
const SHELL_ASSETS = [
  '/hadaf-design-system/',
  '/hadaf-design-system/index.html',
  '/hadaf-design-system/colors_and_type.css',
  '/hadaf-design-system/site/styles.css',
  '/hadaf-design-system/site/Nav.jsx',
  '/hadaf-design-system/site/Hero.jsx',
  '/hadaf-design-system/site/MatchCard.jsx',
  '/hadaf-design-system/site/ArticleCard.jsx',
  '/hadaf-design-system/site/LeagueTable.jsx',
  '/hadaf-design-system/site/Bits.jsx',
  '/hadaf-design-system/site/cache.js',
  '/hadaf-design-system/site/api.js',
  '/hadaf-design-system/site/sportmonksApi.js',
  '/hadaf-design-system/site/newsApi.js',
  '/hadaf-design-system/site/videoApi.js',
  '/hadaf-design-system/site/articleStore.js',
  '/hadaf-design-system/site/ScoresView.jsx',
  '/hadaf-design-system/site/Admin.jsx',
  '/hadaf-design-system/site/App.jsx',
  '/hadaf-design-system/assets/logo/hadaf-wordmark.png',
  '/hadaf-design-system/assets/imagery/stadium-night.png',
  '/hadaf-design-system/assets/imagery/match-action-goal.png',
  '/hadaf-design-system/assets/imagery/match-action-strike.png',
  '/hadaf-design-system/assets/imagery/player-portrait.png',
  '/hadaf-design-system/assets/imagery/ball-macro.png',
  '/hadaf-design-system/assets/crests/team-blue.svg',
  '/hadaf-design-system/assets/crests/team-yellow.svg',
  '/hadaf-design-system/assets/crests/team-black.svg',
  '/hadaf-design-system/assets/crests/team-red.svg',
];

// Install: pre-cache the shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_ASSETS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()) // don't block install on cache failures
  );
});

// Activate: clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: stale-while-revalidate for same-origin; network-only for external
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only intercept GET requests to same origin
  if (request.method !== 'GET') return;
  if (!url.pathname.startsWith('/hadaf-design-system/') && url.origin !== self.location.origin) return;

  // Don't intercept API calls (data should always be fresh)
  const isApiCall = url.hostname !== self.location.hostname;
  if (isApiCall) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(request).then(cached => {
        const networkFetch = fetch(request)
          .then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => null);

        // Return cached immediately, update in background
        return cached || networkFetch;
      })
    )
  );
});
