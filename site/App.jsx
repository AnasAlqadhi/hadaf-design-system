/* global React, HdNav, HdHero, HdMatchCard, HdArticleCard, HdLeagueTable,
          HdLiveTicker, HdBreakingBar, HdAdSlot, HdFooter, HdIcon,
          HdScoresView, HadafNews, HadafSportmonks, HdMostRead, HdSkeleton,
          HdMatchDayCard */
const { useState, useEffect, useRef, useCallback } = React;

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

/* ===== HOME VIEW ===== */
function HomeView({ lang, setRoute, openArticle, onFeedLoad }) {
  const [feed, setFeed]         = useState(MOCK_FEED);
  const [heroSlides, setHeroSlides] = useState(MOCK_HERO_SLIDES);
  const [loading, setLoading]   = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const [activeComp, setActiveComp] = useState('all');

  const COMP_TABS = lang === 'ar'
    ? [['all','الكل'],['saudi','دوري روشن'],['ucl','أبطال أوروبا'],['transfers','الانتقالات'],['pl','البريميرليغ']]
    : [['all','All'],['saudi','Saudi League'],['ucl','Champions League'],['transfers','Transfers'],['pl','Premier League']];

  useEffect(() => {
    setLoading(true);
    const keys = HadafNews.getFeedKeysForLang(lang);
    HadafNews.getLatestNews(keys, 15)
      .then(articles => {
        if (!articles.length) return;
        const mapped = articles.map((a, idx) => ({
          kicker:  a.kicker,
          title:   a.title,
          image:   (a.image && a.image.startsWith('http')) ? a.image : LOCAL_IMAGES[idx % LOCAL_IMAGES.length],
          time:    { ar: relativeTime(a.pubDate, 'ar'), en: relativeTime(a.pubDate, 'en') },
          readMin: Math.max(2, Math.round((a.excerpt?.en || a.excerpt || '').split(' ').length / 200) + 2),
          url:     a.url,
          excerpt: a.excerpt,
        }));
        // Build hero slides from first 4 articles with remote images
        const remoteImgArticles = mapped.filter(a => a.image.startsWith('http'));
        const slidePool = remoteImgArticles.length >= 3
          ? remoteImgArticles.slice(0, 4)
          : [...remoteImgArticles, ...MOCK_HERO_SLIDES].slice(0, 4);
        if (slidePool.length) setHeroSlides(slidePool);
        setFeed(mapped);
        onFeedLoad && onFeedLoad(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang]);

  function onSlideClick(slide) {
    if (slide.url) window.open(slide.url, '_blank', 'noopener,noreferrer');
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

  return (
    <>
      <HdBreakingBar items={BREAKING_ITEMS} lang={lang}/>
      <HdLiveTicker matches={MOCK_LIVE} lang={lang} onMatchClick={() => setRoute('scores')}/>

      <HdHero
        slides={heroSlides}
        lang={lang}
        onSlideClick={onSlideClick}
      />

      <div className="hd-container">
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
                    url={a.url || null}
                    onClick={a.url ? undefined : () => openArticle({...a, body:null})}/>
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
                    url={a.url || null}
                    onClick={a.url ? undefined : () => openArticle({...a, body:null})}/>
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
            match={{...MOCK_LIVE[0], status:'live'}}
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
function UCLView({ lang }) {
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
          <div className="hd-bracket-section">
            <div className="hd-bracket-title">{lang === 'ar' ? 'ربع النهائي' : 'Quarter-Finals'}</div>
            <div className="hd-knockout-round">
              {UCL_GROUPS.filter(g => g.round === 'QF').map((g, i) => (
                <div key={i} className="hd-ko-tie">
                  <div className="hd-ko-tie-header">{g.leg}</div>
                  <div className={`hd-ko-team${g.winner === 'home' ? ' is-winner' : ''}`}>
                    <div className="hd-ko-team-name">
                      <img className="hd-ko-team-crest" src={g.home.crest} alt=""/>
                      <span>{g.home.name}</span>
                    </div>
                    <span className="hd-ko-score">{g.homeScore !== null ? g.homeScore : '–'}</span>
                  </div>
                  <div className={`hd-ko-team${g.winner === 'away' ? ' is-winner' : ''}`}>
                    <div className="hd-ko-team-name">
                      <img className="hd-ko-team-crest" src={g.away.crest} alt=""/>
                      <span>{g.away.name}</span>
                    </div>
                    <span className="hd-ko-score">{g.awayScore !== null ? g.awayScore : '–'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hd-bracket-section">
            <div className="hd-bracket-title">{lang === 'ar' ? 'نصف النهائي' : 'Semi-Finals'}</div>
            <div className="hd-knockout-round">
              {UCL_GROUPS.filter(g => g.round === 'SF').map((g, i) => (
                <div key={i} className="hd-ko-tie">
                  <div className="hd-ko-tie-header">{g.leg}</div>
                  <div className="hd-ko-team">
                    <div className="hd-ko-team-name">
                      <img className="hd-ko-team-crest" src={g.home.crest} alt=""/>
                      <span>{g.home.name}</span>
                    </div>
                    <span className="hd-ko-score" style={{color:'var(--fg-3)'}}>–</span>
                  </div>
                  <div className="hd-ko-team">
                    <div className="hd-ko-team-name">
                      <img className="hd-ko-team-crest" src={g.away.crest} alt=""/>
                      <span>{g.away.name}</span>
                    </div>
                    <span className="hd-ko-score" style={{color:'var(--fg-3)'}}>–</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
  return (
    <div className="hd-container" style={{paddingTop:'var(--sp-6)',paddingBottom:'var(--sp-8)'}}>
      <div className="hd-page-head">
        <h1 className="hd-page-title">{lang === 'ar' ? 'الفيديوهات' : 'Videos'}</h1>
        <p className="hd-page-sub">{lang === 'ar'
          ? 'ملخصات المباريات، أجمل الأهداف، والتحليلات التكتيكية.'
          : 'Match highlights, best goals, and tactical breakdowns.'}</p>
      </div>
      <div className="hd-video-grid" style={{marginTop:24}}>
        {VIDEOS.map((v, i) => (
          <div key={i} className="hd-video-card">
            <img className="hd-video-thumb" src={v.thumb} alt=""/>
            <div className="hd-video-play">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="m9 8 6 4-6 4z"/>
              </svg>
            </div>
            <div className="hd-video-duration">{v.duration}</div>
            <div className="hd-video-info">
              <div className="hd-video-title">{t(v.title, lang)}</div>
              <div className="hd-video-meta">{t(v.views, lang)}</div>
            </div>
          </div>
        ))}
        {/* Placeholder cards */}
        {[0,1,2].map(i => (
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
    </div>
  );
}

/* ===== WORLD CUP PAGE ===== */
function WorldCupView({ lang }) {
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
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
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

/* ===== ARTICLE VIEW ===== */
function ArticleView({ lang, article, setRoute }) {
  if (!article) { setRoute('home'); return null; }
  const title   = t(article.title, lang);
  const kicker  = t(article.kicker, lang);
  const body    = article.body ? t(article.body, lang) : null;
  const excerpt = typeof article.excerpt === 'string' ? article.excerpt : (article.excerpt && article.excerpt[lang]) || '';

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
            <span>{lang === 'ar' ? 'بقلم سعد العتيبي' : 'By Saad Al-Otaibi'}</span>
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
          {article.url && (
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
  const [route, setRoute]       = useState('home');
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

  const openArticle = (a) => { setArticle(a); setRoute('article'); window.scrollTo(0, 0); };

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
      {route === 'wc'        && <WorldCupView lang={lang}/>}
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
