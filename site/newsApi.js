// -------------------------------------------------------
// Hadaf — News API
// Tries multiple CORS proxies in sequence
// -------------------------------------------------------

const PROXIES = [
  url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  url => `https://thingproxy.freeboard.io/fetch/${url}`,
];

async function fetchRSS(feedUrl) {
  for (const makeProxy of PROXIES) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(makeProxy(feedUrl), { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) continue;
      const text = await res.text();
      if (text && text.includes('<item>')) return text;
    } catch(e) {
      console.warn('Proxy failed, trying next...', e.message);
    }
  }
  throw new Error('All proxies failed for: ' + feedUrl);
}

const NEWS_FEEDS = {
  sky_en: {
    name: { ar: 'سكاي سبورتس', en: 'Sky Sports' },
    url: 'https://www.skysports.com/rss/12040', // football-only feed
    lang: 'en',
    footballOnly: true,
  },
  espn: {
    name: { ar: 'ESPN', en: 'ESPN FC' },
    url: 'https://www.espn.com/espn/rss/soccer/news', // soccer-only feed
    lang: 'en',
    footballOnly: true,
  },
  // ---- Arabic feeds (mixed sports — keyword-filtered to football) ----
  bbc_ar: {
    name: { ar: 'BBC عربي', en: 'BBC Arabic' },
    url: 'https://feeds.bbci.co.uk/arabic/sport/rss.xml',
    lang: 'ar',
  },
  aljazeera_ar: {
    name: { ar: 'الجزيرة الرياضية', en: 'Al Jazeera Sport' },
    url: 'https://www.aljazeera.net/xml/rss/sports.xml',
    lang: 'ar',
  },
  russia_today_ar: {
    name: { ar: 'RT عربي رياضة', en: 'RT Arabic Sport' },
    url: 'https://arabic.rt.com/rss/sport/',
    lang: 'ar',
  },
};

// ----- Football-only filter -----
// Some of the Arabic feeds (BBC Sport AR, Al Jazeera Sport, RT Sport) carry all sports.
// We keep only items whose title or description hits a football keyword AND don't hit
// a clear non-football sport keyword.
const FOOTBALL_INCLUDE_RX = new RegExp([
  // Arabic football vocabulary
  'كرة\\s*القدم', 'كرة\\s*قدم', 'مباراة', 'مباريات', 'دوري', 'الدوري',
  'هدف', 'أهداف', 'تسجيل', 'مرمى', 'ركلة', 'ضربة\\s*جزاء',
  'الهلال', 'النصر', 'الاتحاد', 'الأهلي', 'الشباب', 'الاتفاق', 'النصر',
  'الاتحاد', 'القادسية', 'التعاون', 'الفتح', 'الرياض', 'الفيحاء',
  'ريال\\s*مدريد', 'برشلونة', 'أتلتيكو', 'ليفربول', 'مانشستر', 'تشيلسي',
  'أرسنال', 'يوفنتوس', 'ميلان', 'إنتر', 'نابولي', 'بايرن', 'دورتموند',
  'باريس', 'مارسيليا', 'بنفيكا', 'بورتو', 'أياكس',
  'ميسي', 'رونالدو', 'كريستيانو', 'نيمار', 'مبابي', 'هالاند', 'بنزيمة',
  'فينيسيوس', 'مودريتش', 'سالم', 'الدوسري', 'كانتي', 'فيرمينو',
  'فيفا', 'يويفا', 'الفيفا', 'اليويفا', 'الأبطال', 'روشن',
  'البريميرليغ', 'الليغا', 'البوندسليغا', 'السيريا', 'الفرنسي',
  'كأس\\s*العالم', 'أمم\\s*أوروبا', 'كأس\\s*آسيا', 'كأس\\s*الخليج',
  'المنتخب', 'الأخضر',
  // English football vocabulary
  'football', 'soccer', 'fifa', 'uefa', 'premier\\s*league', 'la\\s*liga',
  'serie\\s*a', 'bundesliga', 'ligue\\s*1', 'champions\\s*league', 'europa\\s*league',
  'world\\s*cup', 'euros?\\b', 'saudi\\s*pro\\s*league', 'roshn',
  'ronaldo', 'messi', 'neymar', 'mbapp', 'haaland', 'benzema', 'vinicius',
  'modric', 'salah', 'kane', 'son', 'de\\s*bruyne',
  'manchester', 'liverpool', 'chelsea', 'arsenal', 'tottenham', 'newcastle',
  'real\\s*madrid', 'barcelona', 'atletico', 'juventus', 'milan', 'inter',
  'bayern', 'dortmund', 'psg', 'paris\\s*saint',
  'al-?hilal', 'al-?nassr', 'al-?ittihad', 'al-?ahli',
].join('|'), 'i');

// Hard exclusions — clearly non-football sports terms
const FOOTBALL_EXCLUDE_RX = new RegExp([
  // Arabic
  'تنس', 'كرة\\s*السلة', 'كرة\\s*الطائرة', 'الطائرة', 'السلة',
  'الجودو', 'الكاراتيه', 'التايكوندو', 'الجمباز', 'السباحة', 'الفروسية',
  'الشطرنج', 'الملاكمة', 'الرغبي', 'الكريكيت', 'الغولف', 'فورمولا',
  'الدراجات', 'البلياردو', 'البولينغ', 'الجولف',
  // English
  '\\btennis\\b', '\\bbasketball\\b', '\\bvolleyball\\b', '\\bhandball\\b',
  '\\bjudo\\b', '\\bkarate\\b', '\\btaekwondo\\b', '\\bgymnastics\\b',
  '\\bswimming\\b', '\\bequestrian\\b', '\\bchess\\b', '\\bboxing\\b',
  '\\brugby\\b', '\\bcricket\\b', '\\bgolf\\b', '\\bformula\\s*1\\b',
  '\\bf1\\b', '\\bmotogp\\b', '\\bnba\\b', '\\bnfl\\b', '\\bmlb\\b',
  '\\bnhl\\b', '\\bufc\\b', '\\bmma\\b', '\\bcycling\\b',
].join('|'), 'i');

function isFootballArticle(article) {
  const haystack = (article.title.ar || '') + ' ' + (article.title.en || '') +
                   ' ' + (article.excerpt.ar || '') + ' ' + (article.excerpt.en || '');
  if (FOOTBALL_EXCLUDE_RX.test(haystack)) return false;
  return FOOTBALL_INCLUDE_RX.test(haystack);
}

// Fetch + parse one RSS feed
async function getFeedArticles(feedKey, count = 10) {
  const feed = NEWS_FEEDS[feedKey];
  if (!feed) throw new Error(`Unknown feed: ${feedKey}`);

  const text = await fetchRSS(feed.url);
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  // Pull more items than requested so the football filter still leaves enough
  const items = Array.from(doc.querySelectorAll('item')).slice(0, count * 4);

  const all = items.map(item => normalizeItem(item, feed));
  // Football-only feeds already filtered upstream — others get keyword filter
  const filtered = feed.footballOnly ? all : all.filter(isFootballArticle);
  return filtered.slice(0, count);
}

// Fetch from multiple feeds, merged + sorted newest first (5-min cache)
async function getLatestNews(feedKeys = ['sky_en', 'espn'], count = 8) {
  const cacheKey = `news:${feedKeys.slice().sort().join(',')}:${count}`;
  return window.HadafCache.cachedFetch(
    cacheKey,
    5 * 60 * 1000,
    async () => {
      const requests = feedKeys.map(k =>
        getFeedArticles(k, count)
          .catch(err => { console.warn(`Feed "${k}" failed:`, err.message); return []; })
      );
      const results = await Promise.all(requests);
      const merged = results.flat();
      if (!merged.length) throw new Error('All feeds returned empty (likely all proxies down)');
      merged.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      return merged;
    },
    'news'
  );
}

// Convenience: pick feeds by UI language
function getFeedKeysForLang(lang) {
  return lang === 'ar'
    ? ['bbc_ar', 'aljazeera_ar', 'russia_today_ar']
    : ['sky_en', 'espn'];
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

window.HadafNews = { NEWS_FEEDS, getFeedArticles, getLatestNews, getFeedKeysForLang };
