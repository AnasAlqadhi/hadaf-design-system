// Hadaf Service Worker — network-first for content, cache-first for static assets.
//
// Why network-first: this is a NEWS site. The previous "cache-first" strategy served a
// stale copy on every repeat visit, so new articles + new deploys only appeared on a
// second visit — making the live site look frozen. Now, when you're online you always
// get the freshest HTML/JS/data; the cache is only a fallback for offline.
//
// Bump CACHE_VERSION whenever this strategy changes to wipe old caches on activate.

const CACHE_VERSION = 'v3';
const CACHE_NAME = `hadaf-${CACHE_VERSION}`;
const BASE = '/hadaf-design-system/';

// Minimal offline fallback shell (kept small on purpose).
const PRECACHE = [BASE, BASE + 'index.html'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Treat images/fonts as static (cache-first); everything else is content (network-first).
const STATIC_RX = /\.(png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf)$/i;

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch external APIs/CDNs

  // Static assets: cache-first (fast, they rarely change).
  if (STATIC_RX.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached =>
          cached || fetch(request).then(res => { if (res.ok) cache.put(request, res.clone()); return res; })
        )
      )
    );
    return;
  }

  // Content (HTML / JS / JSX / CSS / JSON): network-first, fall back to cache offline.
  event.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(request).then(cached => cached || caches.match(BASE))
      )
  );
});
