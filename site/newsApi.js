// -------------------------------------------------------
// Hadaf — News API via RSS→JSON (rss2json.com)
// No auth needed, no CORS issues, free tier = 10k req/day
// -------------------------------------------------------

const RSS2JSON = 'https://api.rss2json.com/v1/api.json';

const NEWS_FEEDS = {
  bbc_ar: {
    name: { ar: 'BBC عربي', en: 'BBC Arabic' },
    url: 'https://feeds.bbci.co.uk/arabic/sport/rss.xml',
    lang: 'ar',
  },
  goal_ar: {
    name: { ar: 'Goal عربي', en: 'Goal Arabic' },
    url: 'https://www.goal.com/ar/feeds/news',
    lang: 'ar',
  },
  sky_en: {
    name: { ar: 'سكاي سبورتس', en: 'Sky Sports' },
    url: 'https://www.skysports.com/rss/12040',
    lang: 'en',
  },
  guardian_en: {
    name: { ar: 'الغارديان', en: 'The Guardian Football' },
    url: 'https://www.theguardian.com/football/rss',
    lang: 'en',
  },
};

// Fetch articles from a single feed key
async function getFeedArticles(feedKey, count = 10) {
  const feed = NEWS_FEEDS[feedKey];
  if (!feed) throw new Error(`Unknown feed: ${feedKey}`);

  const url = `${RSS2JSON}?rss_url=${encodeURIComponent(feed.url)}&count=${count}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`RSS fetch error ${res.status}`);
  const data = await res.json();
  if (data.status !== 'ok') throw new Error(`RSS error: ${data.message || 'unknown'}`);

  return (data.items || []).map(item => normalizeArticle(item, feed));
}

// Fetch from multiple feeds merged + sorted by date
async function getLatestNews(feedKeys = ['bbc_ar', 'goal_ar'], count = 8) {
  const requests = feedKeys.map(k =>
    getFeedArticles(k, count)
      .catch(err => { console.warn(`Feed ${k} failed:`, err.message); return []; })
  );
  const results = await Promise.all(requests);
  const merged = results.flat();
  // Sort newest first
  merged.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  return merged.slice(0, count * feedKeys.length);
}

// Normalise RSS item → Hadaf article shape
function normalizeArticle(item, feed) {
  // Extract first image from content or enclosure
  let image = item.enclosure?.link || item.thumbnail || '';
  if (!image && item.content) {
    const m = item.content.match(/<img[^>]+src=["']([^"']+)["']/);
    if (m) image = m[1];
  }

  return {
    id: item.guid || item.link,
    title: { ar: item.title, en: item.title },   // RSS gives one lang
    kicker: { ar: feed.name.ar, en: feed.name.en },
    excerpt: { ar: stripHtml(item.description || '').slice(0, 160), en: stripHtml(item.description || '').slice(0, 160) },
    image,
    url: item.link,
    pubDate: item.pubDate,
    source: feed.name,
    lang: feed.lang,
  };
}

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

window.HadafNews = {
  NEWS_FEEDS,
  getFeedArticles,
  getLatestNews,
};
