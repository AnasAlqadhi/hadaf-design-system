/**
 * Hadaf — Autonomous News Pipeline
 *
 * Runs every 6 hours via GitHub Actions (free).
 * Fetches RSS → filters football → rewrites in Arabic in Hadaf's voice
 * using Google Gemini 2.0 Flash (free tier: 1M tokens/day, no credit card).
 * Saves to data/feed.json — site loads this instantly, no CORS proxies.
 *
 * Usage:
 *   node scripts/fetch-rewrite.mjs           (full run)
 *   node scripts/fetch-rewrite.mjs --dry-run (fetch + parse, no AI calls)
 *
 * Requires env:  GEMINI_API_KEY  (free at aistudio.google.com)
 */

import { XMLParser }    from 'fast-xml-parser';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath }    from 'node:url';

const __dir     = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dir, '..');
const FEED_PATH = resolve(ROOT, 'data', 'feed.json');
const DRY_RUN   = process.argv.includes('--dry-run');

const GEMINI_KEY      = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL    = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

// Log key status upfront so we can see it in Actions logs
console.log(`🔑 GEMINI_API_KEY: ${GEMINI_KEY ? `set (${GEMINI_KEY.length} chars, starts with ${GEMINI_KEY.slice(0,8)}…)` : '⚠ NOT SET'}`);

const MAX_NEW_PER_RUN   = 10;  // AI rewrites per run (free tier is generous)
const MAX_ARTICLES_KEPT = 80;  // total articles stored in feed.json
const MAX_AGE_DAYS      = 7;   // drop articles older than this

// ─── RSS SOURCES ──────────────────────────────────────────────────────────────
const FEEDS = [
  { key: 'sky_en',       url: 'https://www.skysports.com/rss/12040',             name: { ar: 'سكاي سبورتس',       en: 'Sky Sports'      }, lang: 'en' },
  { key: 'espn',         url: 'https://www.espn.com/espn/rss/soccer/news',       name: { ar: 'ESPN',               en: 'ESPN FC'         }, lang: 'en' },
  { key: 'bbc_ar',       url: 'https://feeds.bbci.co.uk/arabic/sport/rss.xml',   name: { ar: 'BBC عربي',           en: 'BBC Arabic'      }, lang: 'ar' },
  { key: 'aljazeera_ar', url: 'https://www.aljazeera.net/xml/rss/sports.xml',    name: { ar: 'الجزيرة الرياضية', en: 'Al Jazeera Sport' }, lang: 'ar' },
  { key: 'goal_en',      url: 'https://www.goal.com/feeds/en/news',              name: { ar: 'Goal',               en: 'Goal.com'        }, lang: 'en' },
];

// ─── FOOTBALL FILTER ──────────────────────────────────────────────────────────
const INCLUDE_RX = new RegExp([
  'football|soccer|fifa|uefa|premier.?league|la.?liga|serie.?a|bundesliga|ligue.?1',
  'champions.?league|europa.?league|world.?cup|euro|saudi.?pro.?league|roshn',
  'ronaldo|messi|neymar|mbapp|haaland|benzema|vinicius|modric|salah|kane',
  'manchester|liverpool|chelsea|arsenal|real.?madrid|barcelona|atletico|juventus',
  'milan|inter|bayern|psg|dortmund|al.?hilal|al.?nassr|al.?ittihad|al.?ahli',
  'كرة.?القدم|مباراة|دوري|الهلال|النصر|الاتحاد|الأهلي|أبطال.?أوروبا|روشن',
  'منتخب|كأس.?العالم|ريال.?مدريد|برشلونة|ليفربول|مانشستر|رونالدو|ميسي|مبابي',
].join('|'), 'i');

const EXCLUDE_RX = new RegExp([
  '\\b(tennis|basketball|volleyball|handball|cricket|golf|formula.?1|\\bf1\\b|mma|ufc|nba|nfl|boxing|rugby|cycling)\\b',
  'تنس|كرة.?السلة|الملاكمة|الرغبي|الكريكيت|الغولف|فورمولا|جودو|سباحة',
].join('|'), 'i');

function isFootball(text) {
  if (EXCLUDE_RX.test(text)) return false;
  return INCLUDE_RX.test(text);
}

// ─── RSS PARSE ────────────────────────────────────────────────────────────────
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  stopNodes: ['*.description'],
});

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

async function fetchFeed(feed) {
  const res = await fetch(feed.url, {
    headers: { 'User-Agent': 'Hadaf/2.0 (+https://anasalqadhi.github.io/hadaf-design-system/)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const xml  = await res.text();
  const data = xmlParser.parse(xml);
  const items = data?.rss?.channel?.item || data?.feed?.entry || [];
  const arr   = Array.isArray(items) ? items : [items];

  return arr.slice(0, 25).map(item => {
    const title = str(item.title);
    const link  = str(item.link) || str(item['@_href']) || str(item.guid);
    const desc  = stripHtml(
      str(item.description) || str(item.summary) || str(item['content:encoded']) || ''
    ).slice(0, 350);
    const pub   = str(item.pubDate) || str(item.published) || new Date().toISOString();

    let image = '';
    if (item['media:thumbnail']) image = str(item['media:thumbnail']['@_url'] || item['media:thumbnail']);
    if (!image && item['media:content']) image = str(item['media:content']['@_url'] || '');
    if (!image) {
      const raw = str(item.description) + str(item['content:encoded']);
      const m   = raw.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (m) image = m[1];
    }
    if (!image && item.enclosure) image = str(item.enclosure['@_url'] || '');

    return { title, link, desc, pub, image, source: feed.name, lang: feed.lang, feedKey: feed.key };
  }).filter(a => a.title && a.link);
}

// ─── KICKER CLASSIFIER ────────────────────────────────────────────────────────
function classifyKicker(text) {
  const t = text.toLowerCase();
  if (/champions.?league|أبطال.?أوروبا/.test(t))  return { ar: 'دوري أبطال أوروبا', en: 'Champions League' };
  if (/europa.?league/.test(t))                     return { ar: 'الدوري الأوروبي',   en: 'Europa League'  };
  if (/premier.?league|بريميرليغ/.test(t))          return { ar: 'البريميرليغ',       en: 'Premier League' };
  if (/la.?liga|ليغا/.test(t))                      return { ar: 'الليغا',            en: 'La Liga'        };
  if (/serie.?a|سيريا/.test(t))                     return { ar: 'الدوري الإيطالي',   en: 'Serie A'        };
  if (/bundesliga|بوندسليغا/.test(t))               return { ar: 'البوندسليغا',       en: 'Bundesliga'     };
  if (/ligue.?1|الفرنسي/.test(t))                   return { ar: 'الدوري الفرنسي',    en: 'Ligue 1'        };
  if (/world.?cup|كأس.?العالم/.test(t))             return { ar: 'كأس العالم',        en: 'World Cup'      };
  if (/saudi|roshn|روشن|السعودي/.test(t))           return { ar: 'دوري روشن',         en: 'Saudi League'   };
  if (/transfer|انتقال|صفقة/.test(t))               return { ar: 'الانتقالات',        en: 'Transfers'      };
  return                                                    { ar: 'أخبار',             en: 'Football'       };
}

// ─── GEMINI REWRITE ───────────────────────────────────────────────────────────
// Hadaf voice: passionate Arabic fan, punchy headlines, not wire-service neutral.
// Source link always kept. Gemini Flash free tier: 1M tokens/day.

const SYSTEM_PROMPT = `أنت محرر كروي متحمس لدى موقع "هدف" — موقع عربي يغطي كرة القدم بأسلوب المشجع الحقيقي.
مهمتك: إعادة كتابة الخبر التالي بالعربية بأسلوب هدف الخاص — حماسي، مباشر، يخاطب المشجع العربي.

القواعد الصارمة:
١. اكتب عنواناً عربياً جذاباً ومثيراً (ليس ترجمة حرفية).
٢. اكتب ثلاث فقرات قصيرة: الخبر الرئيسي — السياق والتفاصيل — ما يعنيه للجمهور.
٣. كل فقرة جملتان أو ثلاث فقط.
٤. استخدم مفردات كروية عربية فصيحة وصحيحة.
٥. لا تترجم الأسماء الأجنبية، اكتبها كما هي بالعربية (ريال مدريد، أرسنال، هالاند...).
٦. حدد صنف البطولة من هذه القائمة فقط: دوري روشن | البريميرليغ | الليغا | الدوري الإيطالي | البوندسليغا | الدوري الفرنسي | دوري أبطال أوروبا | الدوري الأوروبي | كأس العالم | الانتقالات | أخبار

أجب بـ JSON صالح فقط، بلا أي نص خارجه:
{
  "title_ar": "العنوان بالعربية",
  "kicker_ar": "صنف البطولة",
  "kicker_en": "Competition in English",
  "excerpt_ar": "جملة تشويقية واحدة",
  "body_ar": ["الفقرة الأولى", "الفقرة الثانية", "الفقرة الثالثة"]
}`;

async function rewriteWithGemini(raw) {
  if (!GEMINI_KEY) return buildFallback(raw);

  const userMsg = [
    `العنوان: ${raw.title}`,
    `الملخص: ${raw.desc}`,
    `المصدر: ${str(raw.source?.en || raw.source)}`,
  ].join('\n');

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: userMsg }] }],
    generationConfig: { temperature: 0.75, maxOutputTokens: 900, responseMimeType: 'application/json' },
  });

  try {
    const res  = await fetch(GEMINI_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal:  AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini ${res.status}: ${err.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Gemini with responseMimeType:json returns JSON directly, but let's be safe
    const json = typeof text === 'object' ? text : JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');

    if (!json.title_ar || !Array.isArray(json.body_ar) || !json.body_ar.length) {
      throw new Error('Incomplete JSON from Gemini');
    }

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
      lang:      'ar',
    };
  } catch (err) {
    console.warn(`  ⚠ Gemini failed for "${raw.title.slice(0, 50)}": ${err.message}`);
    return buildFallback(raw);
  }
}

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
  console.log(`\n🏟  Hadaf autonomous pipeline  [${DRY_RUN ? 'DRY RUN' : 'LIVE'}]`);
  console.log(`    Model : Gemini ${GEMINI_MODEL}`);
  console.log(`    Key   : ${GEMINI_KEY ? `${GEMINI_KEY.slice(0,8)}… (${GEMINI_KEY.length} chars)` : '⚠ NOT SET — will use fallback only'}\n`);

  // Load existing articles
  let existing = [];
  if (existsSync(FEED_PATH)) {
    try { existing = JSON.parse(readFileSync(FEED_PATH, 'utf8')).articles || []; }
    catch { existing = []; }
  }

  const existingUrls = new Set(existing.map(a => a.id || a.url));

  // Drop old articles
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000;
  existing = existing.filter(a => {
    const ts = new Date(a.pubDate).getTime();
    return isNaN(ts) || ts > cutoff;
  });

  // Fetch all feeds
  console.log('📡 Fetching RSS feeds…');
  const allRaw = [];
  for (const feed of FEEDS) {
    try {
      const items   = await fetchFeed(feed);
      const football = items.filter(a => isFootball(a.title + ' ' + a.desc));
      allRaw.push(...football);
      console.log(`   ✓ ${feed.key}: ${football.length}/${items.length} football articles`);
    } catch (err) {
      console.warn(`   ✗ ${feed.key}: ${err.message}`);
    }
  }

  // Only new articles, newest first
  const newRaw = allRaw
    .filter(a => !existingUrls.has(a.link))
    .sort((a, b) => new Date(b.pub) - new Date(a.pub));

  // Existing articles that failed rewrite — retry them if Gemini key is now available
  const existingFallbacks = (!DRY_RUN && GEMINI_KEY)
    ? existing.filter(a => !a.rewritten)
    : [];

  console.log(`\n📰 ${newRaw.length} new articles | ${existingFallbacks.length} fallbacks to retry | ${existing.length} in feed\n`);

  // Rewrite new articles first, then retry fallbacks up to the per-run cap
  const toRewriteNew = DRY_RUN ? [] : newRaw.slice(0, MAX_NEW_PER_RUN);
  const slotsLeft    = Math.max(0, MAX_NEW_PER_RUN - toRewriteNew.length);
  const toRetry      = existingFallbacks.slice(0, slotsLeft);
  const passthroughRaw = newRaw.slice(DRY_RUN ? 0 : MAX_NEW_PER_RUN);

  // Rewrite new articles
  const rewritten = [];
  const allToWrite = [...toRewriteNew];
  for (let i = 0; i < allToWrite.length; i++) {
    const raw = allToWrite[i];
    console.log(`   ✍  [${i+1}/${allToWrite.length}] "${raw.title.slice(0, 65)}…"`);
    rewritten.push(await rewriteWithGemini(raw));
    if (i < allToWrite.length - 1) await new Promise(r => setTimeout(r, 400));
  }

  // Retry existing fallbacks — convert stored article back to raw format
  const retried = new Map();
  for (let i = 0; i < toRetry.length; i++) {
    const a = toRetry[i];
    const raw = {
      title: a.title?.en || a.title?.ar || '',
      desc:  a.excerpt?.en || a.excerpt?.ar || '',
      link:  a.id || a.url,
      pub:   a.pubDate,
      image: a.image || '',
      source: a.source,
      lang:  a.lang || 'en',
    };
    console.log(`   🔄 retry [${i+1}/${toRetry.length}] "${raw.title.slice(0, 65)}…"`);
    const result = await rewriteWithGemini(raw);
    retried.set(a.id || a.url, result);
    if (i < toRetry.length - 1) await new Promise(r => setTimeout(r, 400));
  }

  // Apply retries back into existing
  existing = existing.map(a => retried.get(a.id || a.url) || a);

  const passthrough = passthroughRaw.map(buildFallback);

  // Merge, dedup, sort, cap
  const seen  = new Set();
  const final = [...rewritten, ...passthrough, ...existing]
    .filter(a => {
      const key = a.id || a.url;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    })
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, MAX_ARTICLES_KEPT);

  // Stats
  const nRewritten = rewritten.filter(a => a.rewritten).length;
  const nFallback  = rewritten.filter(a => !a.rewritten).length;
  const nRetried   = [...retried.values()].filter(a => a.rewritten).length;
  console.log(`\n📊 Results:`);
  console.log(`   Rewritten (new)     : ${nRewritten}`);
  console.log(`   Retried fallbacks   : ${nRetried}/${toRetry.length}`);
  console.log(`   Fallback (no AI)    : ${nFallback + passthrough.length}`);
  console.log(`   Total in feed       : ${final.length}`);

  if (!DRY_RUN) {
    const out = { version: 2, updated: new Date().toISOString(), count: final.length, articles: final };
    writeFileSync(FEED_PATH, JSON.stringify(out, null, 2) + '\n');
    console.log(`\n✅ Saved to data/feed.json`);
  } else {
    console.log(`\n🔍 Dry run complete — no files written`);
  }
}

main().catch(err => { console.error('\n❌ Pipeline crashed:', err); process.exit(1); });
