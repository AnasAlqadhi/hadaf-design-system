/**
 * Hadaf — Autonomous News Pipeline
 *
 * Runs on every GitHub Actions deploy (every 6 hours + every push).
 * Fetches RSS feeds, rewrites articles in Arabic in Hadaf's passionate
 * fan voice using Claude Haiku, and saves to data/feed.json.
 *
 * The static site then loads data/feed.json directly — no CORS proxies,
 * no browser-side RSS parsing, instant load.
 *
 * Usage:
 *   node scripts/fetch-rewrite.mjs           (full run)
 *   node scripts/fetch-rewrite.mjs --dry-run (fetch + parse, no Claude calls)
 */

import Anthropic from '@anthropic-ai/sdk';
import { XMLParser } from 'fast-xml-parser';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir     = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dir, '..');
const FEED_PATH = resolve(ROOT, 'data', 'feed.json');
const DRY_RUN   = process.argv.includes('--dry-run');
const MAX_NEW_PER_RUN    = 8;   // Claude calls per run (cost control)
const MAX_ARTICLES_KEPT  = 80;  // total articles kept in feed.json
const MAX_AGE_DAYS       = 7;   // drop articles older than this

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const anthropic     = ANTHROPIC_KEY ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null;

// ─── RSS SOURCES ──────────────────────────────────────────────────────────────
const FEEDS = [
  {
    key: 'sky_en',
    url: 'https://www.skysports.com/rss/12040',
    name: { ar: 'سكاي سبورتس', en: 'Sky Sports' },
    lang: 'en',
    footballOnly: true,
  },
  {
    key: 'espn',
    url: 'https://www.espn.com/espn/rss/soccer/news',
    name: { ar: 'ESPN', en: 'ESPN FC' },
    lang: 'en',
    footballOnly: true,
  },
  {
    key: 'bbc_ar',
    url: 'https://feeds.bbci.co.uk/arabic/sport/rss.xml',
    name: { ar: 'BBC عربي', en: 'BBC Arabic' },
    lang: 'ar',
  },
  {
    key: 'aljazeera_ar',
    url: 'https://www.aljazeera.net/xml/rss/sports.xml',
    name: { ar: 'الجزيرة الرياضية', en: 'Al Jazeera Sport' },
    lang: 'ar',
  },
  {
    key: 'goal_en',
    url: 'https://www.goal.com/feeds/en/news',
    name: { ar: 'Goal', en: 'Goal.com' },
    lang: 'en',
    footballOnly: true,
  },
];

// ─── FOOTBALL KEYWORD FILTER ──────────────────────────────────────────────────
const FOOTBALL_RX = new RegExp([
  'football|soccer|fifa|uefa|premier.?league|la.?liga|serie.?a|bundesliga|ligue.?1',
  'champions.?league|europa.?league|world.?cup|euro|saudi.?pro.?league|roshn',
  'ronaldo|messi|neymar|mbapp|haaland|benzema|vinicius|modric|salah|kane',
  'manchester|liverpool|chelsea|arsenal|real.?madrid|barcelona|atletico|juventus|milan|inter|bayern|psg',
  'al.?hilal|al.?nassr|al.?ittihad|al.?ahli',
  'كرة.?القدم|مباراة|دوري|الهلال|النصر|الاتحاد|الأهلي|أبطال.?أوروبا|روشن|منتخب|كأس.?العالم',
  'ريال.?مدريد|برشلونة|ليفربول|مانشستر|رونالدو|ميسي|مبابي|هالاند|بنزيمة',
].join('|'), 'i');

const NON_FOOTBALL_RX = new RegExp([
  '\\b(tennis|basketball|volleyball|handball|cricket|golf|formula.?1|f1|mma|ufc|nba|nfl|boxing|rugby)\\b',
  'تنس|كرة.?السلة|كرة.?الطائرة|الملاكمة|الرغبي|الكريكيت|الغولف|فورمولا|جودو|سباحة',
].join('|'), 'i');

function isFootball(text) {
  if (NON_FOOTBALL_RX.test(text)) return false;
  return FOOTBALL_RX.test(text);
}

// ─── RSS FETCH + PARSE ────────────────────────────────────────────────────────
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  stopNodes: ['*.description'],
});

async function fetchFeed(feed) {
  console.log(`  Fetching ${feed.key}…`);
  const res = await fetch(feed.url, {
    headers: { 'User-Agent': 'Hadaf/2.0 (+https://anasalqadhi.github.io/hadaf-design-system/)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml  = await res.text();
  const data = parser.parse(xml);

  const items = data?.rss?.channel?.item || data?.feed?.entry || [];
  const arr   = Array.isArray(items) ? items : [items];

  return arr.slice(0, 20).map(item => {
    const title = str(item.title);
    const link  = str(item.link) || str(item['@_href']) || str(item.guid);
    const desc  = stripHtml(str(item.description) || str(item.summary) || str(item['content:encoded']) || '').slice(0, 300);
    const pub   = str(item.pubDate) || str(item.published) || str(item.updated) || new Date().toISOString();

    // Image extraction
    let image = '';
    if (item['media:thumbnail']) image = item['media:thumbnail']['@_url'] || '';
    if (!image && item['media:content']) image = item['media:content']['@_url'] || '';
    if (!image) {
      const m = (str(item.description) + str(item['content:encoded'])).match(/<img[^>]+src=["']([^"']+)["']/i);
      if (m) image = m[1];
    }
    if (!image && item.enclosure) image = item.enclosure['@_url'] || '';

    return { title, link, desc, pub, image, feedKey: feed.key, source: feed.name, lang: feed.lang };
  }).filter(a => a.title && a.link);
}

function str(v) {
  if (!v) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'object') {
    if (v.__cdata) return String(v.__cdata).trim();
    if (v['#text']) return String(v['#text']).trim();
  }
  return String(v).trim();
}

function stripHtml(s) {
  return s.replace(/<[^>]*>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

// ─── KICKER CLASSIFICATION ────────────────────────────────────────────────────
function classifyKicker(text) {
  const t = text.toLowerCase();
  if (/champions.?league|أبطال.?أوروبا|دوري.?أبطال/.test(t))  return { ar: 'دوري أبطال أوروبا', en: 'Champions League' };
  if (/premier.?league|بريميرليغ/.test(t))                      return { ar: 'البريميرليغ', en: 'Premier League' };
  if (/la.?liga|ليغا/.test(t))                                   return { ar: 'الليغا', en: 'La Liga' };
  if (/serie.?a|سيريا/.test(t))                                  return { ar: 'الدوري الإيطالي', en: 'Serie A' };
  if (/bundesliga|بوندسليغا/.test(t))                            return { ar: 'البوندسليغا', en: 'Bundesliga' };
  if (/ligue.?1|الفرنسي/.test(t))                                return { ar: 'الدوري الفرنسي', en: 'Ligue 1' };
  if (/world.?cup|كأس.?العالم/.test(t))                          return { ar: 'كأس العالم', en: 'World Cup' };
  if (/saudi|roshn|روشن|الدوري.?السعودي|السعودي/.test(t))        return { ar: 'دوري روشن', en: 'Saudi League' };
  if (/transfer|انتقال|صفقة/.test(t))                            return { ar: 'الانتقالات', en: 'Transfers' };
  if (/مباراة|fixture|match|result/.test(t))                     return { ar: 'نتائج', en: 'Results' };
  return { ar: 'أخبار', en: 'Football' };
}

// ─── CLAUDE REWRITE ───────────────────────────────────────────────────────────
// Hadaf voice: passionate Arabic fan, punchy, not wire-service neutral.
// Full article body + proper kicker classification.
// Source URL is always preserved for attribution.

const SYSTEM_PROMPT = `أنت محرر كروي لدى موقع "هدف" — موقع عربي متخصص في أخبار كرة القدم.
أسلوبك: حماسي وعاطفي بصوت المشجع الحقيقي، دقيق في المعلومات، ليس بارداً كأسلوب وكالات الأنباء.
مهمتك: إعادة كتابة الخبر الرياضي التالي بالعربية بأسلوب هدف الخاص.

القواعد:
- اكتب عنواناً جذاباً ومثيراً (ليس ترجمة حرفية).
- اكتب ثلاث فقرات: الأولى الخبر الرئيسي، الثانية السياق والتفاصيل، الثالثة ما يعنيه ذلك للجمهور العربي.
- استخدم مفردات كروية عربية صحيحة.
- لا تُطوّل: كل فقرة 2-3 جمل.
- لا تذكر "هدف" أو "موقعنا" داخل المقال.
- أضف صنف البطولة من: [دوري روشن | البريميرليغ | الليغا | الدوري الإيطالي | البوندسليغا | الدوري الفرنسي | دوري أبطال أوروبا | كأس العالم | الانتقالات | أخبار].

أجب بـ JSON فقط — لا نص آخر:
{
  "title_ar": "...",
  "kicker_ar": "...",
  "kicker_en": "...",
  "excerpt_ar": "...",
  "body_ar": ["فقرة 1", "فقرة 2", "فقرة 3"]
}`;

async function rewriteArticle(raw) {
  if (!anthropic) {
    // Dry run / no key — return a placeholder so the pipeline still works
    return buildFallback(raw);
  }

  const userMsg = `العنوان الأصلي: ${raw.title}\nالملخص: ${raw.desc}\nالمصدر: ${str(raw.source?.en || raw.source)}`;

  try {
    const msg = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: userMsg }],
    });

    const text = msg.content[0]?.text || '';
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');

    if (!json.title_ar || !json.body_ar) throw new Error('Claude returned incomplete JSON');

    return {
      id:        raw.link,
      title:     { ar: json.title_ar,  en: raw.title },
      kicker:    { ar: json.kicker_ar || 'أخبار', en: json.kicker_en || 'Football' },
      excerpt:   { ar: json.excerpt_ar || '', en: raw.desc },
      body:      { ar: json.body_ar },
      image:     raw.image || '',
      url:       raw.link,
      source:    raw.source,
      pubDate:   raw.pub,
      rewritten: true,
      lang:      raw.lang,
    };
  } catch (err) {
    console.warn(`  Claude failed for "${raw.title.slice(0, 50)}":`, err.message);
    return buildFallback(raw);
  }
}

// Fallback when Claude call fails or no API key: keep original as-is
function buildFallback(raw) {
  const kicker = classifyKicker(raw.title + ' ' + raw.desc);
  return {
    id:        raw.link,
    title:     { ar: raw.title, en: raw.title },
    kicker,
    excerpt:   { ar: raw.desc, en: raw.desc },
    body:      null,
    image:     raw.image || '',
    url:       raw.link,
    source:    raw.source,
    pubDate:   raw.pub,
    rewritten: false,
    lang:      raw.lang,
  };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🏟  Hadaf news pipeline — ${DRY_RUN ? 'DRY RUN' : 'live'}\n`);

  // Load existing feed
  let existing = [];
  if (existsSync(FEED_PATH)) {
    try {
      const saved = JSON.parse(readFileSync(FEED_PATH, 'utf8'));
      existing    = saved.articles || [];
    } catch { existing = []; }
  }

  const existingUrls = new Set(existing.map(a => a.id || a.url));

  // Cutoff: drop articles older than MAX_AGE_DAYS
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000;
  existing = existing.filter(a => {
    const d = new Date(a.pubDate).getTime();
    return isNaN(d) || d > cutoff;
  });

  // Fetch all RSS feeds
  console.log('📡 Fetching RSS feeds…');
  const allRaw = [];
  for (const feed of FEEDS) {
    try {
      const items = await fetchFeed(feed);
      allRaw.push(...items);
      console.log(`  ✓ ${feed.key}: ${items.length} items`);
    } catch (err) {
      console.warn(`  ✗ ${feed.key}: ${err.message}`);
    }
  }

  // Filter football + deduplicate
  const newRaw = allRaw
    .filter(a => {
      if (existingUrls.has(a.link)) return false;
      const text = a.title + ' ' + a.desc;
      return isFootball(text);
    })
    .sort((a, b) => new Date(b.pub) - new Date(a.pub));

  console.log(`\n📰 ${newRaw.length} new football articles found`);

  // Rewrite up to MAX_NEW_PER_RUN with Claude
  const toRewrite = DRY_RUN ? [] : newRaw.slice(0, MAX_NEW_PER_RUN);
  const fallbacks = newRaw.slice(DRY_RUN ? 0 : MAX_NEW_PER_RUN).map(buildFallback);

  const rewritten = [];
  for (const raw of toRewrite) {
    console.log(`  ✍️  Rewriting: "${raw.title.slice(0, 60)}…"`);
    const article = await rewriteArticle(raw);
    rewritten.push(article);
    // Polite pause to avoid rate limits
    await new Promise(r => setTimeout(r, 500));
  }

  // Merge: rewritten first, then fallbacks, then existing
  const merged = [...rewritten, ...fallbacks, ...existing];

  // Deduplicate by id/url, sort newest first, cap total
  const seen    = new Set();
  const final   = merged
    .filter(a => {
      const key = a.id || a.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, MAX_ARTICLES_KEPT);

  const out = {
    version:  2,
    updated:  new Date().toISOString(),
    count:    final.length,
    articles: final,
  };

  if (!DRY_RUN) {
    writeFileSync(FEED_PATH, JSON.stringify(out, null, 2) + '\n');
    console.log(`\n✅ Saved ${final.length} articles to data/feed.json`);
    console.log(`   (${rewritten.filter(a => a.rewritten).length} rewritten by Claude, ${rewritten.filter(a => !a.rewritten).length} fallback, ${fallbacks.length} pass-through)`);
  } else {
    console.log(`\n🔍 Dry run — would save ${final.length} articles (${toRewrite.length} to rewrite)`);
  }
}

main().catch(err => { console.error('Pipeline failed:', err); process.exit(1); });
