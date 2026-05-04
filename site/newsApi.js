// -------------------------------------------------------
// Hadaf — News API
// Uses corsproxy.io CORS proxy + browser DOMParser
// No auth, no build step, works from any origin
// -------------------------------------------------------

const CORS = 'https://corsproxy.io/?url=';

// Fetch with timeout helper
async function fetchWithTimeout(url, ms = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

const NEWS_FEEDS = {
  guardian_en: {
    name: { ar: 'الغارديان', en: 'The Guardian' },
    url: 'https://www.theguardian.com/football/rss',
    lang: 'en',
  },
  bbc_en: {
    name: { ar: 'BBC Sport', en: 'BBC Sport' },
    url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
    lang: 'en',
  },
  sky_en: {
    name: { ar: 'سكاي سبورتس', en: 'Sky Sports' },
    url: 'https://www.skysports.com/rss/12040',
    lang: 'en',
  },
  espn: {
    name: { ar: 'ESPN', en: 'ESPN FC' },
    url: 'https://www.espn.com/espn/rss/soccer/news',
    lang: 'en',
  },
};

// Fetch + parse one RSS feed
async function getFeedArticles(feedKey, count = 10) {
  const feed = NEWS_FEEDS[feedKey];
  if (!feed) throw new Error(`Unknown feed: ${feedKey}`);

  const proxyUrl = CORS + encodeURIComponent(feed.url);
  const res = await fetchWithTimeout(proxyUrl);
  if (!res.ok) throw new Error(`Proxy error ${res.status}`);
  const text = await res.text();
  if (!text) throw new Error('Empty proxy response');

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const items = Array.from(doc.querySelectorAll('item')).slice(0, count);

  return items.map(item => normalizeItem(item, feed));
}

// Fetch from multiple feeds, merged + sorted newest first
async function getLatestNews(feedKeys = ['guardian_en', 'bbc_en'], count = 8) {
  const requests = feedKeys.map(k =>
    getFeedArticles(k, count)
      .catch(err => { console.warn(`Feed "${k}" failed:`, err.message); return []; })
  );
  const results = await Promise.all(requests);
  const merged = results.flat();
  merged.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  return merged;
}

// Parse a single <item> node → Hadaf article shape
function normalizeItem(item, feed) {
  const getText = tag => item.querySelector(tag)?.textContent?.trim() || '';
  const title   = getText('title');
  const link    = getText('link') || item.querySelector('link')?.nextSibling?.textContent?.trim() || '';
  const desc    = stripHtml(getText('description')).slice(0, 180);
  const pubDate = getText('pubDate');

  // Image: try media:thumbnail, enclosure, or first <img> in description
  let image = '';
  const mediaThumbs = item.getElementsByTagNameNS('*', 'thumbnail');
  if (mediaThumbs.length) image = mediaThumbs[0].getAttribute('url') || '';
  if (!image) {
    const enc = item.querySelector('enclosure');
    if (enc && enc.getAttribute('type')?.startsWith('image')) image = enc.getAttribute('url') || '';
  }
  if (!image) {
    const rawDesc = getText('description');
    const m = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/);
    if (m) image = m[1];
  }

  return {
    id: getText('guid') || link,
    title: { ar: title, en: title },
    kicker: feed.name,
    excerpt: { ar: desc, en: desc },
    image,
    url: link,
    pubDate,
    source: feed.name,
    lang: feed.lang,
  };
}

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

window.HadafNews = { NEWS_FEEDS, getFeedArticles, getLatestNews };
