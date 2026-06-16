/* global React, HdNav, HdHero, HdMatchCard, HdArticleCard, HdLeagueTable,
          HdLiveTicker, HdBreakingBar, HdAdSlot, HdFooter, HdIcon,
          HdScoresView, HadafNews, HadafSportmonks, HdMostRead, HdSkeleton,
          HdMatchDayCard, HdAdmin, HadafVideoApi */
const { useState, useEffect, useRef, useCallback } = React;

/* ===== HASH ROUTING HELPERS ===== */
const HASH_TO_ROUTE = {
  '':            'home',
  '#':           'home',
  '#home':       'home',
  '#scores':     'scores',
  '#league':     'league',
  '#ucl':        'ucl',
  '#transfers':  'transfers',
  '#video':      'video',
  '#wc':         'wc',
  '#admin':      'admin',
  '#article':    'article',
};
const ROUTE_TO_HASH = {
  home:      '#home',
  scores:    '#scores',
  league:    '#league',
  ucl:       '#ucl',
  transfers: '#transfers',
  video:     '#video',
  wc:        '#wc',
  admin:     '#admin',
  article:   '#article',
};
function hashToRoute(hash) { return HASH_TO_ROUTE[hash] || 'home'; }

/* ===== TEAM REGISTRY ===== */
const TEAMS = {
  hilal:   { ar:'الهلال',   en:'Al-Hilal',    crest:'assets/crests/team-blue.svg' },
  nassr:   { ar:'النصر',    en:'Al-Nassr',    crest:'assets/crests/team-yellow.svg' },
  ittihad:{ ar:'الاتحاد',  en:'Al-Ittihad',  crest:'assets/crests/team-black.svg' },
  ahli:    { ar:'الأهلي',   en:'Al-Ahli',     crest:'assets/crests/team-red.svg' },
  shabab:  { ar:'الشباب',   en:'Al-Shabab',   crest:'assets/crests/team-blue.svg' },
  ettifaq: { ar:'الاتفاق',  en:'Al-Ettifaq',  crest:'assets/crests/team-red.svg' },
};

/* ===== STATIC DATA ===== */
const MOCK_LIVE = [
  { home:TEAMS.hilal,    away:TEAMS.nassr,   scoreHome:2, scoreAway:1, minute:78, status:'live' },
  { home:TEAMS.ittihad,  away:TEAMS.ahli,    scoreHome:1, scoreAway:1, minute:62, status:'live' },
];

const BREAKING_ITEMS = [
  { ar:'عاجل: الهلال يتعاقد رسمياً مع نجم الدوري الإيطالي', en:'BREAKING: Al-Hilal complete signing of Serie A star' },
  { ar:'هازارد يُقرّر الاعتزال عن كرة القدم في سن 33', en:'Hazard announces retirement from football aged 33' },
  { ar:'ريال مدريد يعلن تجديد عقد فينيسيوس حتى 2030', en:'Real Madrid confirm Vinicius renewal until 2030' },
  { ar:'المنتخب السعودي يستعد لمباراة الحسم أمام أستراليا', en:'Saudi NT prepares for decisive clash against Australia' },
];

const MOCK_HERO_SLIDES = [
  {
    kicker: { ar:'حصري · ديربي الرياض', en:'Exclusive · Riyadh Derby' },
    title:  { ar:'ليلة لا تُنسى يكتبها الهلال في ديربي الرياض', en:'A historic night for Al-Hilal in the Riyadh Derby' },
    image:  'assets/imagery/match-action-goal.png',
    time:   { ar:'قبل ساعتين', en:'2h ago' },
    readMin: 4,
  },
  {
    kicker: { ar:'دوري الأبطال', en:'Champions League' },
    title:  { ar:'ريال مدريد يُتوّج بالأبطال للمرة التاسعة عشرة في تاريخه', en:'Real Madrid crowned European champions for a record 19th time' },
    image:  'assets/imagery/stadium-night.png',
    time:   { ar:'قبل 4 ساعات', en:'4h ago' },
    readMin: 5,
  },
  {
    kicker: { ar:'انتقالات', en:'Transfers' },
    title:  { ar:'صفقة القرن: النصر يتفاوض مع نجم أوروبا الجديد', en:'Deal of the century: Al-Nassr in talks with Europe\'s next big star' },
    image:  'assets/imagery/match-action-strike.png',
    time:   { ar:'أمس', en:'Yesterday' },
    readMin: 3,
  },
];

const MOCK_FEED = [
  { kicker:{ar:'دوري روشن',en:'Saudi League'}, title:{ar:'الاتحاد يستعيد الصدارة بثلاثية أمام الأهلي',en:'Al-Ittihad reclaim top spot with 3–0 win over Al-Ahli'}, image:'assets/imagery/stadium-night.png', time:{ar:'قبل ساعة',en:'1h ago'}, readMin:3 },
  { kicker:{ar:'دوري الأبطال',en:'Champions League'}, title:{ar:'ريال مدريد يتجاوز السيتي في معركة الجبابرة',en:'Real Madrid edge past City in clash of giants'}, image:'assets/imagery/match-action-strike.png', time:{ar:'قبل 3 ساعات',en:'3h ago'}, readMin:5 },
  { kicker:{ar:'انتقالات',en:'Transfers'}, title:{ar:'صفقة كبرى في الأفق: الهلال يتفاوض مع نجم البريميرليغ',en:'Major deal looms: Al-Hilal in talks with Premier League star'}, image:'assets/imagery/player-portrait.png', time:{ar:'قبل 5 ساعات',en:'5h ago'}, readMin:2 },
  { kicker:{ar:'كأس العالم',en:'World Cup'}, title:{ar:'ميسي يلمح إلى المشاركة في مونديال 2026',en:'Messi hints at playing in the 2026 World Cup'}, image:'assets/imagery/ball-macro.png', time:{ar:'أمس',en:'Yesterday'}, readMin:4 },
  { kicker:{ar:'تحليل',en:'Analysis'}, title:{ar:'لماذا تغير أسلوب المنتخب السعودي تحت قيادة المدرب الجديد',en:'Why the Saudi NT style has shifted under the new boss'}, image:'assets/imagery/match-action-goal.png', time:{ar:'أمس',en:'Yesterday'}, readMin:6 },
  { kicker:{ar:'البريميرليغ',en:'Premier League'}, title:{ar:'أرسنال يعود لصدارة الدوري الإنجليزي بعد فوز مثير',en:'Arsenal return to top of Premier League after dramatic win'}, image:'assets/imagery/stadium-night.png', time:{ar:'قبل 6 ساعات',en:'6h ago'}, readMin:3 },
  { kicker:{ar:'الليغا',en:'La Liga'}, title:{ar:'برشلونة يسقط في فخ التعادل أمام إشبيلية',en:'Barcelona held to a draw by Sevilla in La Liga thriller'}, image:'assets/imagery/match-action-strike.png', time:{ar:'أمس',en:'Yesterday'}, readMin:4 },
];

const TRANSFERS = [
  { name:{ar:'نجم من الدوري الإيطالي',en:'Serie A star'}, from:{ar:'ميلان',en:'AC Milan'}, to:{ar:'الهلال',en:'Al-Hilal'}, status:'rumour' },
  { name:{ar:'لاعب وسط محوري',en:'Central midfielder'}, from:{ar:'مانشستر سيتي',en:'Man City'}, to:{ar:'النصر',en:'Al-Nassr'}, status:'confirmed' },
  { name:{ar:'مهاجم أوروبي',en:'European striker'}, from:{ar:'دورتموند',en:'Dortmund'}, to:{ar:'الاتحاد',en:'Al-Ittihad'}, status:'done' },
  { name:{ar:'حارس دولي',en:'International keeper'}, from:{ar:'أتلتيكو مدريد',en:'Atletico Madrid'}, to:{ar:'الأهلي',en:'Al-Ahli'}, status:'rumour' },
  { name:{ar:'جناح برازيلي سريع',en:'Brazilian winger'}, from:{ar:'فلامنغو',en:'Flamengo'}, to:{ar:'الشباب',en:'Al-Shabab'}, status:'confirmed' },
];

const STANDINGS = [
  { ...TEAMS.hilal,   p:24, w:18, d:4, l:2, gf:54, ga:18, pts:58, highlight:true },
  { ...TEAMS.nassr,   p:24, w:17, d:3, l:4, gf:51, ga:22, pts:54 },
  { ...TEAMS.ittihad, p:24, w:15, d:5, l:4, gf:42, ga:20, pts:50 },
  { ...TEAMS.ahli,    p:24, w:13, d:6, l:5, gf:38, ga:24, pts:45 },
  { ...TEAMS.shabab,  p:24, w:11, d:7, l:6, gf:32, ga:28, pts:40 },
  { ...TEAMS.ettifaq, p:24, w:9,  d:8, l:7, gf:28, ga:30, pts:35 },
];

const UCL_GROUPS = [
  { round:'QF', leg:'1st leg', home:{name:'Real Madrid', crest:'assets/crests/team-yellow.svg'}, away:{name:'Man City', crest:'assets/crests/team-blue.svg'}, homeScore:3, awayScore:3, winner:'draw' },
  { round:'QF', leg:'2nd leg', home:{name:'Arsenal', crest:'assets/crests/team-red.svg'}, away:{name:'Bayern München', crest:'assets/crests/team-blue.svg'}, homeScore:2, awayScore:1, winner:'home' },
  { round:'QF', leg:'2nd leg', home:{name:'PSG', crest:'assets/crests/team-blue.svg'}, away:{name:'Barcelona', crest:'assets/crests/team-blue.svg'}, homeScore:1, awayScore:2, winner:'away' },
  { round:'SF', leg:'1st leg', home:{name:'Real Madrid', crest:'assets/crests/team-yellow.svg'}, away:{name:'Arsenal', crest:'assets/crests/team-red.svg'}, homeScore:null, awayScore:null, winner:null },
];

const VIDEOS = [
  { title:{ar:'أفضل 10 أهداف في دوري روشن هذا الموسم',en:'Top 10 goals in the Saudi Pro League this season'}, thumb:'assets/imagery/match-action-goal.png', duration:'4:32', views:{ar:'٢.١ م مشاهدة',en:'2.1M views'} },
  { title:{ar:'ملخص مباراة الهلال والنصر - الديربي الكبير',en:'Al-Hilal vs Al-Nassr - Full Match Highlights'}, thumb:'assets/imagery/stadium-night.png', duration:'12:47', views:{ar:'٥.٨ م مشاهدة',en:'5.8M views'} },
  { title:{ar:'تحليل تكتيكي: سر قوة الهلال هذا الموسم',en:'Tactical analysis: The secret behind Al-Hilal\'s dominance'}, thumb:'assets/imagery/match-action-strike.png', duration:'8:15', views:{ar:'١.٣ م مشاهدة',en:'1.3M views'} },
];

/* ===== HELPERS ===== */
const t = (obj, lang) => obj && (obj[lang] !== undefined ? obj[lang] : obj);

function relativeTime(dateStr, lang) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (lang === 'ar') {
    if (mins < 2)  return 'الآن';
    if (mins < 60) return `قبل ${mins} دقيقة`;
    if (hrs < 24)  return `قبل ${hrs} ساعة`;
    if (days === 1) return 'أمس';
    return d.toLocaleDateString('ar-SA');
  }
  if (mins < 2)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24)  return `${hrs}h ago`;
  if (days === 1) return 'yesterday';
  return d.toLocaleDateString('en-GB');
}

const LOCAL_IMAGES = [
  'assets/imagery/match-action-goal.png',
  'assets/imagery/stadium-night.png',
  'assets/imagery/match-action-strike.png',
  'assets/imagery/player-portrait.png',
  'assets/imagery/ball-macro.png',
];

/* ===== SECTION HEADER ===== */
function SectionHeader({ title, badge, onMore, lang }) {
  return (
    <div className="hd-section-hd">
      <div className="hd-section-hd-left">
        <h2>{title}</h2>
        {badge && <span className="hd-section-badge">{badge}</span>}
      </div>
      {onMore && (
        <button className="hd-section-more" onClick={onMore}>
          {lang === 'ar' ? 'المزيد' : 'More'}
          <HdIcon name={lang === 'ar' ? 'chevronL' : 'chevron'} size={14}/>
        </button>
      )}
    </div>
  );
}

/* ===== SCORES PAGE ===== */
function ScoresPage({ lang }) {
  return (
    <div className="hd-container" style={{paddingTop:'var(--sp-6)',paddingBottom:'var(--sp-8)'}}>
      <h2 className="hd-section-title">{lang === 'ar' ? 'النتائج والمباريات' : 'Scores & Fixtures'}</h2>
      <HdScoresView lang={lang}/>
    </div>
  );
}

/* ===== SIDEBAR MATCHES ===== */
function SidebarMatches({ lang }) {
  const [matches, setMatches] = useState(MOCK_LIVE);
  useEffect(() => {
    const smKey = window.HADAF_CONFIG && window.HADAF_CONFIG.SPORTMONKS_KEY;
    if (!smKey || typeof HadafSportmonks === 'undefined') return;
    const today = new Date().toISOString().slice(0, 10);
    HadafSportmonks.getSmFixturesByDate(today)
      .then(blocks => {
        const all = blocks.flatMap(b => b.matches);
        const live     = all.filter(m => m.status === 'live');
        const upcoming = all.filter(m => m.status === 'scheduled');
        const shown    = [...live, ...upcoming].slice(0, 4);
        if (shown.length) {
          setMatches(shown.map(m => ({
            home: { ar: m.home.name.ar, en: m.home.name.en, crest: m.home.logo },
            away: { ar: m.away.name.ar, en: m.away.name.en, crest: m.away.logo },
            scoreHome: m.scoreHome, scoreAway: m.scoreAway,
            status: m.status, minute: m.minute, time: m.time,
          })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="hd-match-list">
      {matches.map((m, i) => (
        <HdMatchCard key={i}
          home={m.home} away={m.away}
          scoreHome={m.scoreHome} scoreAway={m.scoreAway}
          status={m.status === 'live' ? 'live' : m.status === 'ft' ? 'final' : 'upcoming'}
          minute={m.minute || m.time}
          lang={lang}/>
      ))}
    </div>
  );
}

/* ===== TRANSFER SECTION ===== */
function TransferSection({ lang }) {
  const statusLabel = {
    ar: { rumour:'شائعة', confirmed:'مؤكد', done:'رسمي' },
    en: { rumour:'Rumour', confirmed:'Confirmed', done:'Official' },
  };
  return (
    <div className="hd-transfer-section">
      <SectionHeader
        title={lang === 'ar' ? 'سوق الانتقالات' : 'Transfer Market'}
        badge={lang === 'ar' ? 'مباشر' : 'LIVE'}
        lang={lang}
      />
      <div className="hd-transfer-list">
        {TRANSFERS.map((tr, i) => (
          <div key={i} className="hd-transfer-item">
            <span className="hd-transfer-num">{String(i + 1).padStart(2, '0')}</span>
            <div className="hd-transfer-info">
              <h4>{t(tr.name, lang)}</h4>
              <div className="hd-transfer-clubs">
                <span>{t(tr.from, lang)}</span>
                <span className="hd-transfer-arrow">→</span>
                <span style={{color:'var(--hadaf-green)',fontWeight:700}}>{t(tr.to, lang)}</span>
              </div>
            </div>
            <span className={`hd-transfer-tag ${tr.status}`}>
              {statusLabel[lang][tr.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== WORLD CUP BANNER (homepage promo for the live tournament) ===== */
function WorldCupBanner({ lang, setRoute }) {
  return (
    <button className="hd-wc-banner" onClick={() => setRoute('wc')}
      aria-label={lang === 'ar' ? 'كأس العالم 2026' : 'FIFA World Cup 2026'}>
      <span className="hd-wc-banner-scrim" aria-hidden/>
      <span className="hd-wc-banner-inner">
        <span className="hd-wc-banner-flag">
          <span className="hd-wc-live-dot" aria-hidden/>
          {lang === 'ar' ? 'المونديال مباشر' : 'WORLD CUP LIVE'}
        </span>
        <span className="hd-wc-banner-title">
          {lang === 'ar' ? 'كأس العالم 2026' : 'FIFA World Cup 2026'}
        </span>
        <span className="hd-wc-banner-sub">
          {lang === 'ar'
            ? 'الأخبار · المباريات · المجموعات — كل لحظات المونديال في مكان واحد'
            : 'News · Matches · Groups — every World Cup moment in one place'}
        </span>
        <span className="hd-wc-banner-cta">
          {lang === 'ar' ? 'تابع المونديال ←' : 'Follow the tournament →'}
        </span>
      </span>
    </button>
  );
}

/* ===== HOME VIEW ===== */
function HomeView({ lang, setRoute, openArticle, onFeedLoad }) {
  const [feed, setFeed]         = useState(MOCK_FEED);
  const [heroSlides, setHeroSlides] = useState(MOCK_HERO_SLIDES);
  const [loading, setLoading]   = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const [activeComp, setActiveComp] = useState('all');
  const [liveMatches, setLiveMatches] = useState(MOCK_LIVE);

  // Pull today's live + scheduled matches from Sportmonks (cached 5 min by HadafCache)
  useEffect(() => {
    const smKey = window.HADAF_CONFIG && window.HADAF_CONFIG.SPORTMONKS_KEY;
    if (!smKey || typeof HadafSportmonks === 'undefined') return;
    const today = new Date().toISOString().slice(0, 10);
    HadafSportmonks.getSmFixturesByDate(today)
      .then(blocks => {
        const all = blocks.flatMap(b => b.matches);
        const live = all.filter(m => m.status === 'live');
        const next = all.filter(m => m.status === 'scheduled');
        const shown = [...live, ...next].slice(0, 6);
        if (!shown.length) return;
        setLiveMatches(shown.map(m => ({
          home: { ar: m.home.name.ar, en: m.home.name.en, crest: m.home.logo },
          away: { ar: m.away.name.ar, en: m.away.name.en, crest: m.away.logo },
          scoreHome: m.scoreHome, scoreAway: m.scoreAway,
          status: m.status, minute: m.minute, time: m.time,
        })));
      })
      .catch(() => {});
  }, []);

  const COMP_TABS = lang === 'ar'
    ? [['all','الكل'],['saudi','دوري روشن'],['ucl','أبطال أوروبا'],['transfers','الانتقالات'],['pl','البريميرليغ']]
    : [['all','All'],['saudi','Saudi League'],['ucl','Champions League'],['transfers','Transfers'],['pl','Premier League']];

  useEffect(() => {
    setLoading(true);

    // Try pre-baked feed.json first (built by GitHub Actions — instant, no CORS)
    // Fall back to live RSS if the file is empty or fails
    async function loadNews() {
      try {
        const res = await fetch(`data/feed.json?v=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.articles && json.articles.length > 0) return json.articles;
        }
      } catch {}
      // Fallback: fetch live RSS in the browser
      const keys = HadafNews.getFeedKeysForLang(lang);
      return HadafNews.getLatestNews(keys, 15).catch(() => []);
    }

    const keys = HadafNews.getFeedKeysForLang(lang);
    Promise.all([
      loadNews(),
      window.HadafArticleStore
        ? window.HadafArticleStore.loadOverrides()
        : Promise.resolve(null),
    ])
      .then(([articles, overrides]) => {
        const mappedRss = (articles || []).map((a, idx) => ({
          kicker:  a.kicker,
          title:   a.title,
          image:   (a.image && a.image.startsWith('http')) ? a.image : LOCAL_IMAGES[idx % LOCAL_IMAGES.length],
          time:    { ar: relativeTime(a.pubDate, 'ar'), en: relativeTime(a.pubDate, 'en') },
          readMin: Math.max(2, Math.round((a.excerpt?.en || a.excerpt || '').split(' ').length / 200) + 2),
          url:     a.url,
          slug:    a.slug,              // present on AI-rewritten articles → on-site page
          body:    a.body,
          excerpt: a.excerpt,
          pubDate: a.pubDate,
        }));

        // Apply admin overrides (hide / feature / merge custom articles)
        let merged = mappedRss;
        let heroOverride = [];
        if (overrides && window.HadafArticleStore) {
          const result = window.HadafArticleStore.applyOverrides(mappedRss, overrides);
          merged = result.feed;
          heroOverride = result.hero;
          // Custom articles need image normalization (admin may not provide one)
          merged = merged.map((a, idx) =>
            a.image ? a : { ...a, image: LOCAL_IMAGES[idx % LOCAL_IMAGES.length] });
        }

        // ★ World-Cup-first: the tournament is live, so lead the whole site with مونديال
        // news. Stable partition keeps recency order within each group.
        const isWC = a => /كأس\s?العالم|مونديال|world\s?cup/i.test(
          `${t(a.kicker, lang)} ${t(a.title, lang)}`);
        merged = [...merged.filter(isWC), ...merged.filter(a => !isWC(a))];

        // Hero: admin's hero_urls win; otherwise World-Cup articles with images first
        let slidePool;
        if (heroOverride && heroOverride.length) {
          slidePool = heroOverride.slice(0, 5);
        } else {
          const remoteImgArticles = merged.filter(a => a.image && a.image.startsWith('http'));
          const wcImg = remoteImgArticles.filter(isWC);
          const heroPool = [...wcImg, ...remoteImgArticles.filter(a => !isWC(a))];
          slidePool = heroPool.length >= 3
            ? heroPool.slice(0, 4)
            : [...heroPool, ...MOCK_HERO_SLIDES].slice(0, 4);
        }
        if (slidePool.length) setHeroSlides(slidePool);
        if (merged.length) setFeed(merged);
        onFeedLoad && onFeedLoad(merged);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang]);

  function onSlideClick(slide) {
    if (slide.slug) window.location.href = `article/${slide.slug}.html`;  // our on-site page
    else if (slide.url) window.open(slide.url, '_blank', 'noopener,noreferrer');
    else openArticle(slide);
  }

  // Filter articles by competition tab
  const filteredFeed = activeComp === 'all' ? feed : feed.filter(a => {
    const kicker = t(a.kicker, lang) || '';
    const map = {
      saudi:     ['روشن','saudi','سعودي'],
      ucl:       ['أبطال','champions','ucl'],
      transfers: ['انتقالات','transfer'],
      pl:        ['بريميرليغ','premier','pl'],
    };
    const terms = map[activeComp] || [];
    return terms.some(term => kicker.toLowerCase().includes(term));
  });

  const visibleFeed = filteredFeed.slice(0, visibleCount);

  // World Cup spotlight — pull مونديال articles straight from the live feed
  const WC_RX = /كأس\s?العالم|مونديال|world\s?cup/i;
  const wcAll = feed.filter(a => WC_RX.test(`${t(a.kicker, lang)} ${t(a.title, lang)}`));
  const wcArticles = wcAll.slice(0, 4);
  // Live World Cup headlines for the breaking bar (falls back to static if none yet)
  const wcHeadlines = wcAll.slice(0, 6).map(a => a.title);

  return (
    <>
      <HdBreakingBar items={wcHeadlines.length ? wcHeadlines : BREAKING_ITEMS} lang={lang}/>
      <HdLiveTicker matches={liveMatches} lang={lang} onMatchClick={() => setRoute('scores')}/>

      <HdHero
        slides={heroSlides}
        lang={lang}
        onSlideClick={onSlideClick}
      />

      <div className="hd-container">
        <WorldCupBanner lang={lang} setRoute={setRoute}/>
        {/* Competition filter tabs */}
        <div className="hd-comp-tabs" role="tablist" aria-label={lang === 'ar' ? 'تصفية البطولات' : 'Filter by competition'}>
          {COMP_TABS.map(([k, label]) => (
            <button
              key={k}
              className={`hd-comp-tab${activeComp === k ? ' is-active' : ''}`}
              role="tab"
              aria-selected={activeComp === k}
              onClick={() => { setActiveComp(k); setVisibleCount(8); }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="hd-container hd-grid-main">
        <main className="hd-main">
          {loading ? (
            <>
              <div className="hd-feat-grid" style={{marginBottom:28}}>
                {[0,1,2].map(i => <HdSkeleton key={i} variant="feature"/>)}
              </div>
              {[0,1,2,3].map(i => <HdSkeleton key={i} variant="standard"/>)}
            </>
          ) : (
            <>
              {/* World Cup spotlight — live from the feed */}
              {wcArticles.length >= 2 && (
                <section className="hd-wc-spotlight">
                  <div className="hd-section-hd" style={{marginTop:'var(--sp-5)'}}>
                    <div className="hd-section-hd-left">
                      <h2>{lang === 'ar' ? '🏆 مونديال 2026' : '🏆 World Cup 2026'}</h2>
                    </div>
                    <button className="hd-section-more" onClick={() => setRoute('wc')}>
                      {lang === 'ar' ? 'كل الأخبار ←' : 'All news →'}
                    </button>
                  </div>
                  <div className="hd-feat-grid">
                    {wcArticles.map((a, i) => (
                      <HdArticleCard key={`wc${i}`} variant={i === 0 ? 'feature' : 'standard'} lang={lang}
                        kicker={t(a.kicker, lang)} title={t(a.title, lang)} image={a.image}
                        time={t(a.time, lang)} readMin={a.readMin}
                        url={a.slug ? `article/${a.slug}.html` : (a.url || null)}
                        external={!a.slug}
                        onClick={(a.slug || a.url) ? undefined : () => openArticle({...a, body:null})}/>
                    ))}
                  </div>
                </section>
              )}

              {/* Featured 3-col grid */}
              <div className="hd-section-hd" style={{marginTop:'var(--sp-5)'}}>
                <div className="hd-section-hd-left">
                  <h2>{lang === 'ar' ? 'أبرز الأخبار' : 'Top Stories'}</h2>
                </div>
              </div>
              <div className="hd-feat-grid">
                {visibleFeed.slice(0, 3).map((a, i) => (
                  <HdArticleCard key={i} variant="feature" lang={lang}
                    kicker={t(a.kicker, lang)} title={t(a.title, lang)} image={a.image}
                    time={t(a.time, lang)} readMin={a.readMin}
                    url={a.slug ? `article/${a.slug}.html` : (a.url || null)}
                    external={!a.slug}
                    onClick={(a.slug || a.url) ? undefined : () => openArticle({...a, body:null})}/>
                ))}
              </div>

              {/* Transfer news */}
              <TransferSection lang={lang}/>

              {/* More stories list */}
              <SectionHeader
                title={lang === 'ar' ? 'المزيد من الأخبار' : 'More Stories'}
                lang={lang}
              />
              <div className="hd-feed-list">
                {visibleFeed.slice(3).map((a, i) => (
                  <HdArticleCard key={i} variant="standard" lang={lang}
                    kicker={t(a.kicker, lang)} title={t(a.title, lang)} image={a.image}
                    time={t(a.time, lang)} readMin={a.readMin}
                    url={a.slug ? `article/${a.slug}.html` : (a.url || null)}
                    external={!a.slug}
                    onClick={(a.slug || a.url) ? undefined : () => openArticle({...a, body:null})}/>
                ))}
              </div>

              {/* Load more */}
              {visibleCount < filteredFeed.length && (
                <div className="hd-load-more">
                  <button className="hd-load-more-btn" onClick={() => setVisibleCount(c => c + 6)}>
                    <HdIcon name="chevron" size={16}/>
                    {lang === 'ar' ? 'تحميل المزيد' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <aside className="hd-aside">
          {/* Today's feature match */}
          <HdMatchDayCard
            match={liveMatches[0] || MOCK_LIVE[0]}
            lang={lang}
            onViewClick={() => setRoute('scores')}
          />

          {/* Today's matches */}
          <div className="hd-aside-block">
            <h3 className="hd-aside-title">{lang === 'ar' ? 'مباريات اليوم' : "Today's Matches"}</h3>
            <SidebarMatches lang={lang}/>
            <button className="hd-link-btn hd-mt-sm" onClick={() => setRoute('scores')}>
              {lang === 'ar' ? 'جميع النتائج' : 'All scores'}
              <HdIcon name={lang === 'ar' ? 'chevronL' : 'chevron'} size={14}/>
            </button>
          </div>

          <HdAdSlot size="300x250"/>

          {/* League table */}
          <div className="hd-aside-block">
            <h3 className="hd-aside-title">{lang === 'ar' ? 'ترتيب دوري روشن' : 'Roshn League'}</h3>
            <HdLeagueTable rows={STANDINGS.slice(0, 5)} lang={lang} compact/>
            <button className="hd-link-btn hd-mt-sm" onClick={() => setRoute('league')}>
              {lang === 'ar' ? 'الترتيب الكامل' : 'Full standings'}
              <HdIcon name={lang === 'ar' ? 'chevronL' : 'chevron'} size={14}/>
            </button>
          </div>

          {/* Most read */}
          {!loading && feed.length > 0 && (
            <div className="hd-aside-block">
              <h3 className="hd-aside-title">{lang === 'ar' ? 'الأكثر قراءة' : 'Most Read'}</h3>
              <HdMostRead
                articles={[...feed].sort(() => Math.random() - 0.5).slice(0, 5)}
                lang={lang}
                onArticleClick={openArticle}
              />
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

/* ===== LEAGUE PAGE ===== */
function LeagueView({ lang, setRoute }) {
  return (
    <div className="hd-container">
      <div className="hd-page-head">
        <div className="hd-kicker">{lang === 'ar' ? 'الموسم 2025/26' : '2025/26 season'}</div>
        <h1 className="hd-page-title">{lang === 'ar' ? 'دوري روشن السعودي' : 'Saudi Pro League'}</h1>
        <p className="hd-page-sub">{lang === 'ar'
          ? 'ترتيب الفرق، أبرز المباريات، والأخبار من قلب البطولة الأكثر إثارة في المنطقة.'
          : 'Standings, key fixtures, and news from the most exciting league in the region.'}</p>
      </div>
      <div className="hd-grid-main">
        <main className="hd-main">
          <div className="hd-stats-grid" style={{marginBottom:28}}>
            <div className="hd-stat-card">
              <div className="hd-stat-val">24</div>
              <div className="hd-stat-lbl">{lang === 'ar' ? 'مباراة' : 'Played'}</div>
            </div>
            <div className="hd-stat-card">
              <div className="hd-stat-val">72</div>
              <div className="hd-stat-lbl">{lang === 'ar' ? 'هدف' : 'Goals'}</div>
            </div>
            <div className="hd-stat-card">
              <div className="hd-stat-val">16</div>
              <div className="hd-stat-lbl">{lang === 'ar' ? 'فريق' : 'Teams'}</div>
            </div>
          </div>

          <SectionHeader title={lang === 'ar' ? 'ترتيب الدوري' : 'Standings'} lang={lang}/>
          <HdLeagueTable rows={STANDINGS} lang={lang}/>

          <SectionHeader
            title={lang === 'ar' ? 'مباريات اليوم' : 'Live & Today'}
            lang={lang}
            badge={lang === 'ar' ? 'مباشر' : 'LIVE'}
          />
          <div className="hd-match-list">
            {MOCK_LIVE.map((m, i) => (
              <HdMatchCard key={i} home={m.home} away={m.away}
                scoreHome={m.scoreHome} scoreAway={m.scoreAway}
                status="live" minute={m.minute} lang={lang}/>
            ))}
            <HdMatchCard home={TEAMS.hilal} away={TEAMS.ittihad} status="upcoming" minute="20:00" lang={lang}/>
          </div>
        </main>
        <aside className="hd-aside">
          <HdAdSlot size="300x250"/>
          <div className="hd-aside-block">
            <h3 className="hd-aside-title">{lang === 'ar' ? 'هدافو الدوري' : 'Top Scorers'}</h3>
            <ol className="hd-scorers">
              <li><span>1</span><strong>{lang === 'ar' ? 'كريستيانو رونالدو' : 'Cristiano Ronaldo'}</strong><em>22</em></li>
              <li><span>2</span><strong>{lang === 'ar' ? 'ميتروفيتش' : 'Mitrović'}</strong><em>19</em></li>
              <li><span>3</span><strong>{lang === 'ar' ? 'سالم الدوسري' : 'Salem Al-Dawsari'}</strong><em>14</em></li>
              <li><span>4</span><strong>{lang === 'ar' ? 'بنزيمة' : 'Benzema'}</strong><em>12</em></li>
              <li><span>5</span><strong>{lang === 'ar' ? 'مالكوم' : 'Malcom'}</strong><em>11</em></li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ===== UCL PAGE ===== */
const UCL_LEAGUE_ID = 2; // Sportmonks league ID for UEFA Champions League

function UCLView({ lang }) {
  const [rounds, setRounds] = useState(null); // null = not yet fetched
  const [uclLoading, setUclLoading] = useState(false);

  useEffect(() => {
    const smKey = window.HADAF_CONFIG && window.HADAF_CONFIG.SPORTMONKS_KEY;
    if (!smKey || typeof HadafSportmonks === 'undefined') return;
    setUclLoading(true);
    // Fetch the knockout phase — typically Jan → Jun for the current season
    const now   = new Date();
    const year  = now.getFullYear();
    const from  = `${year}-01-01`;
    const to    = `${year}-07-01`;
    HadafSportmonks.getSmLeagueFixtures(UCL_LEAGUE_ID, from, to)
      .then(byRound => {
        if (byRound && Object.keys(byRound).length) setRounds(byRound);
      })
      .catch(() => {})
      .finally(() => setUclLoading(false));
  }, []);

  // Convert live Sportmonks rounds → UCL_GROUPS-compatible shape
  function buildLiveGroups() {
    if (!rounds) return UCL_GROUPS;
    const groups = [];
    for (const [roundName, fixtures] of Object.entries(rounds)) {
      for (const f of fixtures) {
        const homeScore = f.scoreHome !== null ? f.scoreHome : null;
        const awayScore = f.scoreAway !== null ? f.scoreAway : null;
        let winner = null;
        if (homeScore !== null && awayScore !== null) {
          if (homeScore > awayScore) winner = 'home';
          else if (awayScore > homeScore) winner = 'away';
          else winner = 'draw';
        }
        groups.push({
          round: roundName,
          leg:   f.time || '',
          home:  { name: f.home.name.en || f.home.name.ar, crest: f.home.logo || 'assets/crests/team-blue.svg' },
          away:  { name: f.away.name.en || f.away.name.ar, crest: f.away.logo || 'assets/crests/team-yellow.svg' },
          homeScore,
          awayScore,
          winner,
          status: f.status,
        });
      }
    }
    return groups.length ? groups : UCL_GROUPS;
  }

  const liveGroups  = buildLiveGroups();
  const roundNames  = rounds ? Object.keys(rounds) : ['QF', 'SF'];

  return (
    <div className="hd-container">
      <div className="hd-comp-page-header">
        <div className="hd-comp-badge">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--hadaf-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/><path d="M12 3v9l4 4"/>
          </svg>
        </div>
        <div className="hd-comp-page-info">
          <h1>{lang === 'ar' ? 'دوري أبطال أوروبا' : 'UEFA Champions League'}</h1>
          <p>{lang === 'ar' ? 'الموسم 2025/26 · المرحلة الإقصائية' : '2025/26 Season · Knockout Stage'}</p>
        </div>
      </div>

      <div className="hd-stats-grid" style={{marginBottom:32}}>
        <div className="hd-stat-card">
          <div className="hd-stat-val">32</div>
          <div className="hd-stat-lbl">{lang === 'ar' ? 'فريق' : 'Clubs'}</div>
        </div>
        <div className="hd-stat-card">
          <div className="hd-stat-val">125</div>
          <div className="hd-stat-lbl">{lang === 'ar' ? 'هدف سُجّل' : 'Goals scored'}</div>
        </div>
        <div className="hd-stat-card">
          <div className="hd-stat-val">4</div>
          <div className="hd-stat-lbl">{lang === 'ar' ? 'في نصف النهائي' : 'In semis'}</div>
        </div>
      </div>

      <div className="hd-grid-main">
        <main className="hd-main">
          {uclLoading && (
            <div style={{padding:'24px 0',color:'var(--fg-3)',fontSize:13,textAlign:'center'}}>
              {lang === 'ar' ? 'جارٍ تحميل مباريات دوري الأبطال…' : 'Loading Champions League fixtures…'}
            </div>
          )}
          {/* Render one bracket section per round name */}
          {(rounds ? Object.entries(rounds) : [['QF', UCL_GROUPS.filter(g=>g.round==='QF')], ['SF', UCL_GROUPS.filter(g=>g.round==='SF')]]).map(([roundName, fixtures]) => {
            const items = rounds ? buildLiveGroups().filter(g => g.round === roundName) : fixtures;
            return (
              <div key={roundName} className="hd-bracket-section">
                <div className="hd-bracket-title">{roundName}</div>
                <div className="hd-knockout-round">
                  {items.map((g, i) => (
                    <div key={i} className="hd-ko-tie">
                      {g.leg && <div className="hd-ko-tie-header">{g.leg}</div>}
                      <div className={`hd-ko-team${g.winner === 'home' ? ' is-winner' : ''}${g.status === 'live' ? ' is-live' : ''}`}>
                        <div className="hd-ko-team-name">
                          <img className="hd-ko-team-crest" src={g.home.crest} alt="" onError={e => { e.target.style.display='none'; }}/>
                          <span>{g.home.name}</span>
                        </div>
                        <span className="hd-ko-score">{g.homeScore !== null ? g.homeScore : '–'}</span>
                      </div>
                      <div className={`hd-ko-team${g.winner === 'away' ? ' is-winner' : ''}${g.status === 'live' ? ' is-live' : ''}`}>
                        <div className="hd-ko-team-name">
                          <img className="hd-ko-team-crest" src={g.away.crest} alt="" onError={e => { e.target.style.display='none'; }}/>
                          <span>{g.away.name}</span>
                        </div>
                        <span className="hd-ko-score">{g.awayScore !== null ? g.awayScore : '–'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </main>
        <aside className="hd-aside">
          <HdAdSlot size="300x250"/>
          <div className="hd-aside-block">
            <h3 className="hd-aside-title">{lang === 'ar' ? 'هدافو البطولة' : 'Top Scorers'}</h3>
            <ol className="hd-scorers">
              <li><span>1</span><strong>Erling Haaland</strong><em>9</em></li>
              <li><span>2</span><strong>Kylian Mbappé</strong><em>8</em></li>
              <li><span>3</span><strong>Bukayo Saka</strong><em>6</em></li>
              <li><span>4</span><strong>Vinicius Jr.</strong><em>5</em></li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ===== TRANSFERS PAGE ===== */
function TransfersView({ lang }) {
  const statusLabel = {
    ar: { rumour:'شائعة', confirmed:'مؤكد', done:'رسمي' },
    en: { rumour:'Rumour', confirmed:'Confirmed', done:'Official' },
  };
  const EXTENDED_TRANSFERS = [
    ...TRANSFERS,
    { name:{ar:'جناح دولي سريع',en:'International winger'}, from:{ar:'ليفربول',en:'Liverpool'}, to:{ar:'الهلال',en:'Al-Hilal'}, status:'rumour' },
    { name:{ar:'مدافع أيسر',en:'Left-back'}, from:{ar:'بايرن ميونخ',en:'Bayern Munich'}, to:{ar:'النصر',en:'Al-Nassr'}, status:'confirmed' },
    { name:{ar:'مهاجم سعودي شاب',en:'Young Saudi striker'}, from:{ar:'الاتحاد',en:'Al-Ittihad'}, to:{ar:'برشلونة',en:'Barcelona'}, status:'rumour' },
  ];
  return (
    <div className="hd-container" style={{paddingTop:'var(--sp-6)',paddingBottom:'var(--sp-8)'}}>
      <div className="hd-page-head">
        <div className="hd-kicker">{lang === 'ar' ? 'الصيف 2025' : 'Summer 2025'}</div>
        <h1 className="hd-page-title">{lang === 'ar' ? 'سوق الانتقالات' : 'Transfer Market'}</h1>
        <p className="hd-page-sub">{lang === 'ar'
          ? 'آخر أخبار الانتقالات، الصفقات المؤكدة، والشائعات في سوق الكرة.'
          : 'Latest transfer news, confirmed deals, and rumours from the football market.'}</p>
      </div>
      <div className="hd-transfer-section" style={{marginTop:24}}>
        <div className="hd-transfer-list">
          {EXTENDED_TRANSFERS.map((tr, i) => (
            <div key={i} className="hd-transfer-item">
              <span className="hd-transfer-num">{String(i + 1).padStart(2, '0')}</span>
              <div className="hd-transfer-info">
                <h4>{t(tr.name, lang)}</h4>
                <div className="hd-transfer-clubs">
                  <span>{t(tr.from, lang)}</span>
                  <span className="hd-transfer-arrow">→</span>
                  <span style={{color:'var(--hadaf-green)',fontWeight:700}}>{t(tr.to, lang)}</span>
                </div>
              </div>
              <span className={`hd-transfer-tag ${tr.status}`}>
                {statusLabel[lang][tr.status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== VIDEO PAGE ===== */
function VideoView({ lang }) {
  const [videos, setVideos] = useState(VIDEOS);
  const [loadingVid, setLoadingVid] = useState(false);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    const ytKey = window.HADAF_CONFIG && window.HADAF_CONFIG.YOUTUBE_KEY;
    const ytCh  = window.HADAF_CONFIG && window.HADAF_CONFIG.YOUTUBE_CHANNEL_ID;
    if (!ytKey || !ytCh || typeof HadafVideoApi === 'undefined') return;
    setLoadingVid(true);
    HadafVideoApi.getChannelVideos(ytCh, 12)
      .then(items => {
        if (!items.length) return;
        setVideos(items.map(v => ({
          title:   { ar: v.title, en: v.title },
          thumb:   v.thumbnail,
          duration:'',
          views:   { ar: v.channelTitle, en: v.channelTitle },
          videoId: v.videoId,
          url:     v.url,
          embedUrl:v.embedUrl,
        })));
      })
      .catch(() => {})
      .finally(() => setLoadingVid(false));
  }, []);

  function openVideo(v) {
    if (v.videoId) setPlayingId(v.videoId);
    else if (v.url) window.open(v.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="hd-container" style={{paddingTop:'var(--sp-6)',paddingBottom:'var(--sp-8)'}}>
      <div className="hd-page-head">
        <h1 className="hd-page-title">{lang === 'ar' ? 'الفيديوهات' : 'Videos'}</h1>
        <p className="hd-page-sub">{lang === 'ar'
          ? 'ملخصات المباريات، أجمل الأهداف، والتحليلات التكتيكية.'
          : 'Match highlights, best goals, and tactical breakdowns.'}</p>
      </div>
      <div className="hd-video-grid" style={{marginTop:24}}>
        {videos.map((v, i) => (
          <div key={i} className="hd-video-card" onClick={() => openVideo(v)} style={{cursor:'pointer'}}>
            <img className="hd-video-thumb" src={v.thumb} alt=""/>
            <div className="hd-video-play">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="m9 8 6 4-6 4z"/>
              </svg>
            </div>
            {v.duration && <div className="hd-video-duration">{v.duration}</div>}
            <div className="hd-video-info">
              <div className="hd-video-title">{t(v.title, lang)}</div>
              <div className="hd-video-meta">{t(v.views, lang)}</div>
            </div>
          </div>
        ))}
        {/* Coming-soon placeholders when we have fewer than 6 real videos */}
        {videos.length < 6 && [0,1,2].slice(0, 6 - videos.length).map(i => (
          <div key={'ph'+i} className="hd-video-card" style={{background:'var(--card-bg)',border:'1px solid var(--border)'}}>
            <div style={{aspectRatio:'16/9',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:8,color:'var(--fg-3)'}}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
              </svg>
              <span style={{fontSize:13,fontWeight:600}}>{lang === 'ar' ? 'قريباً' : 'Coming soon'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* YouTube embed modal */}
      {playingId && (
        <div className="hd-video-overlay" onClick={() => setPlayingId(null)}>
          <div className="hd-video-modal" onClick={e => e.stopPropagation()}>
            <button className="hd-video-modal-close" onClick={() => setPlayingId(null)} aria-label="Close">
              <HdIcon name="close" size={22}/>
            </button>
            <div className="hd-video-modal-frame">
              <iframe
                src={`https://www.youtube.com/embed/${playingId}?autoplay=1&rel=0`}
                title="YouTube video"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                style={{border:0,width:'100%',height:'100%'}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== WORLD CUP PAGE ===== */
function WorldCupView({ lang, feed = [], openArticle }) {
  const WC_RX = /كأس\s?العالم|مونديال|world\s?cup/i;
  const wcNews = feed.filter(a => WC_RX.test(`${t(a.kicker, lang)} ${t(a.title, lang)}`)).slice(0, 8);
  const groups = [
    { name:'A', teams:[{n:'السعودية',p:2,pts:4},{n:'المكسيك',p:2,pts:4},{n:'أرجنتينا',p:2,pts:3},{n:'بولندا',p:2,pts:0}] },
    { name:'B', teams:[{n:'إنجلترا',p:2,pts:6},{n:'الولايات المتحدة',p:2,pts:3},{n:'إيران',p:2,pts:3},{n:'ويلز',p:2,pts:0}] },
    { name:'C', teams:[{n:'فرنسا',p:2,pts:4},{n:'الدنمارك',p:2,pts:4},{n:'تونس',p:2,pts:1},{n:'أستراليا',p:2,pts:1}] },
  ];
  const enGroups = [
    { name:'A', teams:[{n:'Saudi Arabia',p:2,pts:4},{n:'Mexico',p:2,pts:4},{n:'Argentina',p:2,pts:3},{n:'Poland',p:2,pts:0}] },
    { name:'B', teams:[{n:'England',p:2,pts:6},{n:'USA',p:2,pts:3},{n:'Iran',p:2,pts:3},{n:'Wales',p:2,pts:0}] },
    { name:'C', teams:[{n:'France',p:2,pts:4},{n:'Denmark',p:2,pts:4},{n:'Tunisia',p:2,pts:1},{n:'Australia',p:2,pts:1}] },
  ];
  const gdata = lang === 'ar' ? groups : enGroups;
  return (
    <div className="hd-container" style={{paddingTop:'var(--sp-6)',paddingBottom:'var(--sp-8)'}}>
      <div className="hd-comp-page-header">
        <div className="hd-comp-badge">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--hadaf-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/><path d="M12 3a12 12 0 0 1 0 18"/><path d="M3 12h18"/>
          </svg>
        </div>
        <div className="hd-comp-page-info">
          <h1>{lang === 'ar' ? 'كأس العالم 2026' : 'FIFA World Cup 2026'}</h1>
          <p>{lang === 'ar' ? 'الولايات المتحدة · كندا · المكسيك · 2026' : 'USA · Canada · Mexico · 2026'}</p>
        </div>
      </div>
      <div className="hd-stats-grid" style={{marginBottom:32}}>
        <div className="hd-stat-card">
          <div className="hd-stat-val">48</div>
          <div className="hd-stat-lbl">{lang === 'ar' ? 'منتخب' : 'Nations'}</div>
        </div>
        <div className="hd-stat-card">
          <div className="hd-stat-val">16</div>
          <div className="hd-stat-lbl">{lang === 'ar' ? 'مجموعة' : 'Groups'}</div>
        </div>
        <div className="hd-stat-card">
          <div className="hd-stat-val">104</div>
          <div className="hd-stat-lbl">{lang === 'ar' ? 'مباراة' : 'Matches'}</div>
        </div>
      </div>
      {wcNews.length > 0 && (
        <section style={{marginBottom:32}}>
          <div className="hd-section-hd">
            <div className="hd-section-hd-left">
              <h2>{lang === 'ar' ? 'أخبار المونديال' : 'World Cup News'}</h2>
            </div>
          </div>
          <div className="hd-feat-grid">
            {wcNews.slice(0, 3).map((a, i) => (
              <HdArticleCard key={`wcn${i}`} variant={i === 0 ? 'feature' : 'standard'} lang={lang}
                kicker={t(a.kicker, lang)} title={t(a.title, lang)} image={a.image}
                time={t(a.time, lang)} readMin={a.readMin}
                url={a.slug ? `article/${a.slug}.html` : (a.url || null)}
                external={!a.slug}
                onClick={(a.slug || a.url) ? undefined : () => openArticle && openArticle({...a, body:null})}/>
            ))}
          </div>
          <div className="hd-feed-list" style={{marginTop:12}}>
            {wcNews.slice(3).map((a, i) => (
              <HdArticleCard key={`wcl${i}`} variant="compact" lang={lang}
                kicker={t(a.kicker, lang)} title={t(a.title, lang)} image={a.image}
                time={t(a.time, lang)} readMin={a.readMin}
                url={a.slug ? `article/${a.slug}.html` : (a.url || null)}
                external={!a.slug}
                onClick={(a.slug || a.url) ? undefined : () => openArticle && openArticle({...a, body:null})}/>
            ))}
          </div>
        </section>
      )}

      <div className="hd-section-hd"><div className="hd-section-hd-left">
        <h2>{lang === 'ar' ? 'المجموعات' : 'Groups'}</h2>
      </div></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16,marginTop:12}}>
        {gdata.map(g => (
          <div key={g.name} className="hd-bracket-section" style={{marginBottom:0}}>
            <div className="hd-bracket-title">{lang === 'ar' ? 'المجموعة' : 'Group'} {g.name}</div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead>
                <tr style={{color:'var(--fg-3)'}}>
                  <th style={{textAlign:'start',padding:'6px 4px',fontWeight:700,fontSize:11,letterSpacing:'.06em'}}>{lang==='ar'?'المنتخب':'Team'}</th>
                  <th style={{padding:'6px 4px',fontWeight:700,fontSize:11}}>P</th>
                  <th style={{padding:'6px 4px',fontWeight:700,fontSize:11,color:'var(--hadaf-gold)'}}>PTS</th>
                </tr>
              </thead>
              <tbody>
                {g.teams.map((team, i) => (
                  <tr key={i} style={{borderTop:'1px solid var(--border)',background:i<2?'rgba(14,92,58,0.05)':'transparent'}}>
                    <td style={{padding:'8px 4px',fontWeight:i<2?700:400}}>{team.n}</td>
                    <td style={{padding:'8px 4px',textAlign:'center',fontFamily:'var(--font-mono)'}}>{team.p}</td>
                    <td style={{padding:'8px 4px',textAlign:'center',fontFamily:'var(--font-mono)',fontWeight:700,color:'var(--hadaf-gold)'}}>{team.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== TWITTER EMBED ===== */
function TweetEmbed({ url, lang }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    // twttr.widgets is injected by twitter widget.js loaded in index.html
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(ref.current);
    }
  }, [url]);
  return (
    <div ref={ref} style={{margin:'16px 0'}}>
      <blockquote className="twitter-tweet" data-lang={lang}>
        <a href={url}>{url}</a>
      </blockquote>
    </div>
  );
}

/* ===== ARTICLE VIEW ===== */
function ArticleView({ lang, article, setRoute }) {
  if (!article) { setRoute('home'); return null; }
  const title   = t(article.title, lang);
  const kicker  = t(article.kicker, lang);
  const body    = article.body ? t(article.body, lang) : null;
  const excerpt = typeof article.excerpt === 'string' ? article.excerpt : (article.excerpt && article.excerpt[lang]) || '';

  const isTweet = article.url && /^https?:\/\/(twitter\.com|x\.com)\//.test(article.url);

  return (
    <article className="hd-article-page">
      <div className="hd-article-hero">
        <img src={article.image} alt=""/>
        <div className="hd-article-hero-scrim"/>
      </div>
      <div className="hd-container hd-article-grid">
        <div className="hd-article-body">
          <button className="hd-back" onClick={() => setRoute('home')}>
            <HdIcon name={lang === 'ar' ? 'chevron' : 'chevronL'} size={16}/>
            {lang === 'ar' ? 'العودة للرئيسية' : 'Back to home'}
          </button>
          <div className="hd-kicker">{kicker}</div>
          <h1 className="hd-article-title">{title}</h1>
          <div className="hd-article-meta">
            {article.source && (
              <>
                <span style={{fontWeight:700}}>
                  {typeof article.source === 'object' ? (article.source[lang] || article.source.ar || article.source.en) : article.source}
                </span>
                <span aria-hidden>·</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span>{t(article.time, lang) || (lang === 'ar' ? 'قبل ساعتين' : '2h ago')}</span>
            <span aria-hidden>·</span>
            <span>{article.readMin || 4} {lang === 'ar' ? 'دقائق قراءة' : 'min read'}</span>
            <div className="hd-article-actions">
              <button className="hd-icon-btn"><HdIcon name="bookmark" size={18}/></button>
              <button className="hd-icon-btn" onClick={() => navigator.share && navigator.share({title, url: article.url || window.location.href})}>
                <HdIcon name="share" size={18}/>
              </button>
            </div>
          </div>
          {excerpt && <p className="hd-article-p lead" style={{fontSize:18,lineHeight:1.75,color:'var(--fg-2)',marginBottom:24}}>{excerpt}</p>}
          {body ? body.map((p, i) => (
            <p key={i} className="hd-article-p">{p}</p>
          )) : (
            <p className="hd-article-p">{lang === 'ar'
              ? 'في تطور لافت على الصعيد الكروي، يشهد الملعب عرضاً استثنائياً يلفت أنظار الجماهير والمحللين على حد سواء. المباريات الأخيرة كشفت عن مستوى رفيع من الأداء والاحترافية التي باتت سمةً راسخةً في هذه المرحلة المثيرة من الموسم.'
              : 'In a remarkable development on the football scene, the pitch has witnessed an exceptional display that captures the attention of fans and analysts alike. Recent matches have revealed a high level of performance and professionalism that has become a defining feature of this exciting stage of the season.'}</p>
          )}
          <div className="hd-pullquote">
            {lang === 'ar' ? 'هذا ليس فوزًا عاديًا — هذا فصل جديد في تاريخ البطولة.'
                           : 'This isn\'t just a win — it\'s a new chapter in the championship story.'}
          </div>
          {body && body.slice(0, 1).map((p, i) => (
            <p key={'r'+i} className="hd-article-p">{p}</p>
          ))}
          {isTweet && <TweetEmbed url={article.url} lang={lang}/>}
          {article.url && !isTweet && (
            <div style={{marginTop:24}}>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="hd-btn hd-btn-primary">
                {lang === 'ar' ? 'قراءة المصدر الأصلي ←' : 'Read original source →'}
              </a>
            </div>
          )}
        </div>
        <aside className="hd-aside">
          <HdAdSlot size="300x600"/>
        </aside>
      </div>
    </article>
  );
}

/* ===== MOBILE BOTTOM NAV ===== */
function BottomNav({ lang, route, setRoute }) {
  const items = lang === 'ar'
    ? [['home','الرئيسية','home'],['scores','النتائج','score'],['league','السعودية','table'],['transfers','الانتقالات','transfer'],['video','فيديو','video']]
    : [['home','Home','home'],['scores','Scores','score'],['league','Saudi','table'],['transfers','Transfers','transfer'],['video','Videos','video']];

  return (
    <nav className="hd-bottom-nav" aria-label={lang === 'ar' ? 'التنقل السريع' : 'Quick navigation'}>
      <div className="hd-bottom-nav-inner">
        {items.map(([k, label, icon]) => (
          <button
            key={k}
            className={`hd-bottom-nav-btn${route === k ? ' is-active' : ''}`}
            onClick={() => setRoute(k)}
            aria-label={label}
          >
            <span className="hd-bottom-nav-icon">
              <HdIcon name={icon} size={20}/>
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ===== ROOT APP ===== */
function App() {
  const [lang, setLang]         = useState('ar');
  // Initialise route from URL hash so bookmarks / direct links work
  const [route, setRoute]       = useState(() => hashToRoute(window.location.hash));
  const [article, setArticle]   = useState(null);
  const [theme, setTheme]       = useState('default');
  const [searchOpen, setSearchOpen] = useState(false);
  const [feed, setFeed]         = useState([]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('hadaf-theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('hadaf-theme') || 'default';
    setTheme(savedTheme);
  }, []);

  // Push hash to URL whenever route changes (enables bookmarks & share)
  const skipHashPush = useRef(false);
  useEffect(() => {
    if (skipHashPush.current) { skipHashPush.current = false; return; }
    const hash = ROUTE_TO_HASH[route] || '#home';
    if (window.location.hash !== hash) {
      history.pushState({ route }, '', hash);
    }
  }, [route]);

  // Sync route from browser back/forward
  useEffect(() => {
    const onPop = (e) => {
      const r = hashToRoute(window.location.hash);
      skipHashPush.current = true;
      setRoute(r);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openArticle = (a) => { setArticle(a); setRoute('article'); window.scrollTo(0, 0); };
  // Convenience wrapper so child components can navigate without importing setRoute
  const navigate = useCallback((r) => setRoute(r), []);

  // Admin route is full-screen — hide nav/footer/bottom-nav
  if (route === 'admin') {
    return (
      <div className="hd-app">
        <HdAdmin lang={lang} setRoute={setRoute} feed={feed}/>
      </div>
    );
  }

  return (
    <div className="hd-app">
      <HdNav
        lang={lang} setLang={setLang}
        route={route} setRoute={setRoute}
        theme={theme} setTheme={setTheme}
        feed={feed}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
      />

      {route === 'home' && (
        <HomeView
          lang={lang}
          setRoute={setRoute}
          openArticle={openArticle}
          onFeedLoad={setFeed}
        />
      )}
      {route === 'scores'    && <ScoresPage lang={lang}/>}
      {route === 'league'    && <LeagueView lang={lang} setRoute={setRoute}/>}
      {route === 'ucl'       && <UCLView lang={lang}/>}
      {route === 'transfers' && <TransfersView lang={lang}/>}
      {route === 'video'     && <VideoView lang={lang}/>}
      {route === 'wc'        && <WorldCupView lang={lang} feed={feed} openArticle={openArticle}/>}
      {route === 'article'   && <ArticleView lang={lang} article={article} setRoute={setRoute}/>}

      <HdFooter lang={lang} setRoute={setRoute}/>
      <BottomNav lang={lang} route={route} setRoute={setRoute}/>
    </div>
  );
}

/* ===== ERROR BOUNDARY ===== */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return React.createElement('div', {
        style: { fontFamily:'monospace', padding:'40px', color:'red', background:'#fff', whiteSpace:'pre-wrap' }
      }, '❌ JS Error:\n' + this.state.error.message + '\n\n' + (this.state.error.stack || ''));
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(ErrorBoundary, null, React.createElement(App))
);
