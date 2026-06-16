/**
 * Hadaf — Static SEO page generator
 *
 * Reads data/feed.json and emits, for every AI-rewritten (on-site) article:
 *   article/<slug>.html   — a fully server-rendered Arabic page (real HTML, NewsArticle
 *                           JSON-LD, OG/Twitter, canonical) that Google can index.
 * Plus, at the repo root:
 *   sitemap.xml, rss.xml, robots.txt
 *
 * These are build artifacts — generated fresh each deploy, NOT committed (see .gitignore).
 * GitHub Pages serves them because the workflow uploads the whole working tree.
 *
 * Usage:  node scripts/build-pages.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeSlug } from './lib/slug.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = resolve(__dir, '..');
const FEED_PATH   = resolve(ROOT, 'data', 'feed.json');
const ARTICLE_DIR = resolve(ROOT, 'article');

const BASE_URL  = (process.env.SITE_BASE_URL || 'https://anasalqadhi.github.io/hadaf-design-system').replace(/\/$/, '');
const SITE_NAME = 'هدف';
const DEFAULT_OG = `${BASE_URL}/assets/imagery/stadium-night.png`;
const LOGO_URL   = `${BASE_URL}/assets/logo/hadaf-wordmark.png`;

// ─── helpers ────────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const tx = (v, lang = 'ar') => (v && typeof v === 'object') ? (v[lang] || v.ar || v.en || '') : (v || '');

function isoDate(d) { const t = new Date(d); return isNaN(t) ? new Date().toISOString() : t.toISOString(); }
function rfc822(d)  { const t = new Date(d); return (isNaN(t) ? new Date() : t).toUTCString(); }
function arDate(d)  {
  const t = new Date(d); if (isNaN(t)) return '';
  try { return new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(t); } catch { return t.toISOString().slice(0, 10); }
}
function readMin(body) {
  const words = (Array.isArray(body) ? body.join(' ') : String(body || '')).split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 180));
}
const absImg = (img) => (img && /^https?:\/\//.test(img)) ? img : DEFAULT_OG;

// ─── article page template ──────────────────────────────────────────────────
function renderArticle(a, slug) {
  const titleAr  = tx(a.title);
  const excerpt  = tx(a.excerpt) || titleAr;
  const kicker   = tx(a.kicker) || 'أخبار';
  const sourceNm = tx(a.source);
  const body     = Array.isArray(a.body?.ar) ? a.body.ar : (Array.isArray(a.body) ? a.body : []);
  const img      = absImg(a.image);
  const pageUrl  = `${BASE_URL}/article/${slug}.html`;
  const paras    = body.map(p => `      <p>${esc(p)}</p>`).join('\n');

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: titleAr,
    description: excerpt,
    image: [img],
    datePublished: isoDate(a.pubDate),
    dateModified: isoDate(a.pubDate),
    inLanguage: 'ar',
    articleSection: kicker,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    author:    { '@type': 'Organization', name: SITE_NAME, url: BASE_URL + '/' },
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: LOGO_URL } },
  };

  const sourceLine = a.url
    ? `<p class="hd-art-source">المصدر: <a href="${esc(a.url)}" target="_blank" rel="noopener nofollow">${esc(sourceNm || 'الرابط الأصلي')}</a></p>`
    : (sourceNm ? `<p class="hd-art-source">المصدر: ${esc(sourceNm)}</p>` : '');

  return `<!doctype html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titleAr)} · ${SITE_NAME}</title>
<meta name="description" content="${esc(excerpt)}">
<link rel="canonical" href="${pageUrl}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#0E5C3A">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${esc(titleAr)}">
<meta property="og:description" content="${esc(excerpt)}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:locale" content="ar_AR">
<meta property="article:published_time" content="${isoDate(a.pubDate)}">
<meta property="article:section" content="${esc(kicker)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(titleAr)}">
<meta name="twitter:description" content="${esc(excerpt)}">
<meta name="twitter:image" content="${esc(img)}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230E5C3A'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial,sans-serif' font-weight='900' font-size='20' fill='%23D4A437'%3E%D9%87%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="../colors_and_type.css">
<script>try{var t=localStorage.getItem('hadaf-theme');if(t&&t!=='default')document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
<style>
  body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--font-ar-body),system-ui,sans-serif;line-height:1.85}
  a{color:var(--link)}a:hover{color:var(--link-hover)}
  .hd-art-header{position:sticky;top:0;z-index:10;background:var(--paper);border-bottom:1px solid var(--border);padding:14px 20px}
  .hd-art-header a.hd-brand{font-family:var(--font-ar-display),serif;font-weight:900;font-size:24px;color:var(--hadaf-green);text-decoration:none}
  .hd-art-header a.hd-brand b{color:var(--hadaf-gold)}
  .hd-wrap{max-width:760px;margin:0 auto;padding:24px 20px 64px}
  .hd-kicker{display:inline-block;font-family:var(--font-mono),monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--hadaf-gold-700,#9a7016);background:var(--hadaf-gold-100,#f6ecd2);padding:5px 12px;border-radius:var(--radius-full);margin-bottom:14px}
  h1{font-family:var(--font-ar-display),serif;font-weight:900;font-size:clamp(26px,5vw,40px);line-height:1.25;margin:.2em 0 .4em}
  .hd-meta{color:var(--ink-muted);font-size:14px;margin-bottom:22px;display:flex;gap:10px;flex-wrap:wrap}
  .hd-hero{width:100%;height:auto;border-radius:var(--radius-lg);margin:8px 0 24px;box-shadow:var(--shadow-2)}
  .hd-body p{font-size:18px;margin:0 0 1.2em}
  .hd-art-source{margin-top:28px;padding-top:16px;border-top:1px solid var(--border);color:var(--ink-muted);font-size:14px}
  .hd-foot{max-width:760px;margin:0 auto;padding:24px 20px;border-top:1px solid var(--border);color:var(--ink-muted);font-size:13px;text-align:center}
  .hd-foot a{color:var(--hadaf-green);text-decoration:none;font-weight:700}
  .hd-home-cta{display:inline-block;margin-top:20px;background:var(--hadaf-green);color:#fff;padding:10px 20px;border-radius:var(--radius-full);text-decoration:none;font-weight:700}
</style>
</head>
<body>
<header class="hd-art-header"><a class="hd-brand" href="../">هدف <b>·</b> Hadaf</a></header>
<main class="hd-wrap">
  <article>
    <div class="hd-kicker">${esc(kicker)}</div>
    <h1>${esc(titleAr)}</h1>
    <div class="hd-meta"><span>${esc(arDate(a.pubDate))}</span><span>·</span><span>${readMin(body)} دقائق قراءة</span></div>
    <img class="hd-hero" src="${esc(img)}" alt="${esc(titleAr)}" width="760" height="428" loading="eager">
    <div class="hd-body">
${paras}
    </div>
    ${sourceLine}
    <a class="hd-home-cta" href="../">المزيد من أخبار كرة القدم على هدف ←</a>
  </article>
</main>
<footer class="hd-foot">© ${new Date().getFullYear()} هدف · Hadaf — <a href="../">الصفحة الرئيسية</a></footer>
</body>
</html>
`;
}

// ─── feeds: sitemap, rss, robots ──────────────────────────────────────────────
function renderSitemap(urls, lastmod) {
  const entries = urls.map(u =>
    `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod || lastmod}</lastmod>${u.priority ? `<priority>${u.priority}</priority>` : ''}</url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function renderRss(items) {
  const now = rfc822(Date.now());
  const body = items.map(it => `    <item>
      <title>${esc(it.title)}</title>
      <link>${esc(it.link)}</link>
      <guid isPermaLink="true">${esc(it.link)}</guid>
      <pubDate>${rfc822(it.pubDate)}</pubDate>
      <description>${esc(it.description)}</description>
    </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>هدف · أخبار كرة القدم</title>
    <link>${BASE_URL}/</link>
    <description>أخبار كرة القدم السعودية والعربية والعالمية بأسلوب هدف.</description>
    <language>ar</language>
    <lastBuildDate>${now}</lastBuildDate>
${body}
  </channel>
</rss>
`;
}

const ROBOTS = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;

// ─── main ─────────────────────────────────────────────────────────────────────
function main() {
  if (!existsSync(FEED_PATH)) { console.error('❌ data/feed.json not found'); process.exit(1); }
  const feed = JSON.parse(readFileSync(FEED_PATH, 'utf8'));
  const articles = (feed.articles || []).filter(a => a.rewritten && (Array.isArray(a.body?.ar) ? a.body.ar.length : false));

  // fresh article dir each run (drops pages for articles that aged out of the feed)
  if (existsSync(ARTICLE_DIR)) rmSync(ARTICLE_DIR, { recursive: true, force: true });
  mkdirSync(ARTICLE_DIR, { recursive: true });

  const sitemapUrls = [{ loc: `${BASE_URL}/`, priority: '1.0' }];
  const rssItems = [];
  const seen = new Set();
  let written = 0;

  for (const a of articles) {
    let slug = a.slug || makeSlug(a);
    while (seen.has(slug)) slug += 'x';           // guarantee uniqueness
    seen.add(slug);

    writeFileSync(resolve(ARTICLE_DIR, `${slug}.html`), renderArticle(a, slug));
    written++;

    const loc = `${BASE_URL}/article/${slug}.html`;
    sitemapUrls.push({ loc, lastmod: isoDate(a.pubDate), priority: '0.8' });
    rssItems.push({ title: tx(a.title), link: loc, pubDate: a.pubDate, description: tx(a.excerpt) || tx(a.title) });
  }

  const lastmod = isoDate(feed.updated || Date.now());
  writeFileSync(resolve(ROOT, 'sitemap.xml'), renderSitemap(sitemapUrls, lastmod));
  writeFileSync(resolve(ROOT, 'rss.xml'), renderRss(rssItems.slice(0, 50)));
  writeFileSync(resolve(ROOT, 'robots.txt'), ROBOTS);

  console.log(`✅ Generated ${written} article pages + sitemap.xml (${sitemapUrls.length} urls) + rss.xml + robots.txt`);
}

main();
