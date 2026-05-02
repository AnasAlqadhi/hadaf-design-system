/* global React, HdNav, HdHero, HdMatchCard, HdArticleCard, HdLeagueTable, HdLiveTicker, HdAdSlot, HdFooter, HdIcon */
const { useState, useEffect } = React;

const TEAMS = {
  hilal:    { ar:'الهلال',   en:'Al-Hilal',    crest:'assets/crests/team-blue.svg' },
  nassr:    { ar:'النصر',    en:'Al-Nassr',    crest:'assets/crests/team-yellow.svg' },
  ittihad:  { ar:'الاتحاد',  en:'Al-Ittihad',  crest:'assets/crests/team-black.svg' },
  ahli:     { ar:'الأهلي',   en:'Al-Ahli',     crest:'assets/crests/team-red.svg' },
  shabab:   { ar:'الشباب',   en:'Al-Shabab',   crest:'assets/crests/team-blue.svg' },
  ettifaq:  { ar:'الاتفاق',  en:'Al-Ettifaq',  crest:'assets/crests/team-red.svg' },
};

const LIVE = [
  { home:TEAMS.hilal, away:TEAMS.nassr, scoreHome:2, scoreAway:1, minute:78 },
  { home:TEAMS.ittihad, away:TEAMS.ahli, scoreHome:1, scoreAway:1, minute:62 },
  { home:TEAMS.shabab, away:TEAMS.ettifaq, scoreHome:0, scoreAway:0, minute:34 },
];

const ARTICLES = {
  hero: {
    kicker:{ ar:'حصري · ديربي الرياض', en:'Exclusive · Riyadh Derby' },
    title:{ ar:'ليلة لا تُنسى يكتبها الهلال في ديربي الرياض', en:'A historic night for Al-Hilal in the Riyadh Derby' },
    image:'assets/imagery/match-action-1.svg',
    body:{ ar:[
      'في ليلة لا تُنسى على ملعب المملكة أرينا، خطف الهلال فوز الديربي أمام النصر بهدفين مقابل واحد، وسط أجواء مشحونة بالحماس الجماهيري.',
      'سجّل الهدفين النجم ميتروفيتش في الدقيقة 23، وسالم الدوسري في الدقيقة 56 بضربة رأس مذهلة، فيما رد كريستيانو رونالدو لأصحاب الأرض في الدقيقة 78 من ركلة جزاء.',
      'بهذا الفوز يقترب الهلال خطوة جديدة من لقب دوري روشن، مستفيدًا من تعثر النصر في آخر ثلاث مباريات. الكلاسيكو القادم في جدة يوم السبت لن يكون أقل اشتعالًا.',
    ], en:[
      'On an unforgettable night at Kingdom Arena, Al-Hilal stole the Riyadh derby from Al-Nassr 2–1 in front of a charged home crowd.',
      'Aleksandar Mitrović struck in the 23rd minute, with Salem Al-Dawsari adding a stunning header in the 56th. Cristiano Ronaldo pulled one back from the spot in the 78th.',
      'The win pushes Al-Hilal one step closer to retaining the Roshn League title, capitalizing on Al-Nassr\'s recent stumble. Saturday\'s Jeddah clásico won\'t be any less heated.',
    ]}
  },
};

const FEED = [
  { kicker:{ar:'دوري روشن',en:'Saudi League'}, title:{ar:'الاتحاد يستعيد الصدارة بثلاثية أمام الأهلي',en:'Al-Ittihad reclaim top spot with 3–0 win over Al-Ahli'}, image:'assets/imagery/stadium-crowd.svg', time:{ar:'قبل ساعة',en:'1h ago'}, readMin:3 },
  { kicker:{ar:'دوري الأبطال',en:'Champions League'}, title:{ar:'ريال مدريد يتجاوز السيتي في معركة الجبابرة',en:'Real Madrid edge past City in clash of giants'}, image:'assets/imagery/match-action-1.svg', time:{ar:'قبل 3 ساعات',en:'3h ago'}, readMin:5 },
  { kicker:{ar:'انتقالات',en:'Transfers'}, title:{ar:'صفقة كبرى في الأفق: الهلال يتفاوض مع نجم البريميرليغ',en:'Major deal looms: Al-Hilal in talks with Premier League star'}, image:'assets/imagery/player-portrait.svg', time:{ar:'قبل 5 ساعات',en:'5h ago'}, readMin:2 },
  { kicker:{ar:'كأس العالم',en:'World Cup'}, title:{ar:'ميسي يلمح إلى المشاركة في مونديال 2026',en:'Messi hints at playing in the 2026 World Cup'}, image:'assets/imagery/player-portrait.svg', time:{ar:'أمس',en:'Yesterday'}, readMin:4 },
  { kicker:{ar:'تحليل',en:'Analysis'}, title:{ar:'لماذا تغير أسلوب المنتخب السعودي تحت قيادة المدرب الجديد',en:'Why the Saudi NT style has shifted under the new boss'}, image:'assets/imagery/match-action-1.svg', time:{ar:'أمس',en:'Yesterday'}, readMin:6 },
];

const STANDINGS = [
  { ...TEAMS.hilal, p:24, w:18, d:4, l:2, gf:54, ga:18, pts:58, highlight:true },
  { ...TEAMS.nassr, p:24, w:17, d:3, l:4, gf:51, ga:22, pts:54 },
  { ...TEAMS.ittihad, p:24, w:15, d:5, l:4, gf:42, ga:20, pts:50 },
  { ...TEAMS.ahli, p:24, w:13, d:6, l:5, gf:38, ga:24, pts:45 },
  { ...TEAMS.shabab, p:24, w:11, d:7, l:6, gf:32, ga:28, pts:40 },
  { ...TEAMS.ettifaq, p:24, w:9, d:8, l:7, gf:28, ga:30, pts:35 },
];

const t = (obj, lang) => obj && (obj[lang] !== undefined ? obj[lang] : obj);

function HomeView({ lang, setRoute, openArticle }) {
  return (
    <>
      <HdLiveTicker matches={LIVE} lang={lang} onMatchClick={() => setRoute('league')}/>
      <HdHero
        kicker={t(ARTICLES.hero.kicker, lang)}
        title={t(ARTICLES.hero.title, lang)}
        image={ARTICLES.hero.image}
        lang={lang}
        onClick={() => openArticle(ARTICLES.hero)}
      />
      <div className="hd-container hd-grid-main">
        <main className="hd-main">
          <h2 className="hd-section-title">{lang==='ar' ? 'أبرز الأخبار' : 'Top stories'}</h2>
          <div className="hd-feed">
            {FEED.slice(0,2).map((a, i) => (
              <HdArticleCard key={i} variant="feature" lang={lang}
                kicker={t(a.kicker,lang)} title={t(a.title,lang)} image={a.image}
                time={t(a.time,lang)} readMin={a.readMin}
                onClick={() => openArticle({...a, body:ARTICLES.hero.body})}/>
            ))}
          </div>
          <h2 className="hd-section-title hd-mt">{lang==='ar' ? 'المزيد' : 'More'}</h2>
          <div className="hd-feed-list">
            {FEED.slice(2).map((a,i) => (
              <HdArticleCard key={i} variant="standard" lang={lang}
                kicker={t(a.kicker,lang)} title={t(a.title,lang)} image={a.image}
                time={t(a.time,lang)} readMin={a.readMin}
                onClick={() => openArticle({...a, body:ARTICLES.hero.body})}/>
            ))}
          </div>
        </main>
        <aside className="hd-aside">
          <div className="hd-aside-block">
            <h3 className="hd-aside-title">{lang==='ar' ? 'مباريات اليوم' : "Today's matches"}</h3>
            <div className="hd-match-list">
              {LIVE.map((m,i) => (
                <HdMatchCard key={i} home={m.home} away={m.away}
                  scoreHome={m.scoreHome} scoreAway={m.scoreAway}
                  status="live" minute={m.minute} lang={lang}/>
              ))}
            </div>
          </div>
          <HdAdSlot size="300x250"/>
          <div className="hd-aside-block">
            <h3 className="hd-aside-title">{lang==='ar' ? 'ترتيب دوري روشن' : 'Roshn League table'}</h3>
            <HdLeagueTable rows={STANDINGS.slice(0,5)} lang={lang} compact/>
            <button className="hd-link-btn hd-mt-sm" onClick={() => setRoute('league')}>
              {lang==='ar' ? 'عرض الترتيب الكامل' : 'Full standings'} <HdIcon name={lang==='ar'?'chevronL':'chevron'} size={14}/>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}

function LeagueView({ lang, setRoute }) {
  return (
    <div className="hd-container">
      <div className="hd-page-head">
        <div className="hd-kicker">{lang==='ar' ? 'الموسم 2025/26' : '2025/26 season'}</div>
        <h1 className="hd-page-title">{lang==='ar' ? 'دوري روشن السعودي' : 'Saudi Pro League'}</h1>
        <p className="hd-page-sub">{lang==='ar'
          ? 'ترتيب الفرق، أبرز المباريات، والأخبار من قلب البطولة الأكثر إثارة في المنطقة.'
          : 'Standings, key fixtures, and news from the most exciting league in the region.'}</p>
      </div>
      <div className="hd-grid-main">
        <main className="hd-main">
          <h2 className="hd-section-title">{lang==='ar' ? 'الترتيب' : 'Standings'}</h2>
          <HdLeagueTable rows={STANDINGS} lang={lang}/>
          <h2 className="hd-section-title hd-mt">{lang==='ar' ? 'مباريات اليوم' : 'Live & today'}</h2>
          <div className="hd-match-list">
            {LIVE.map((m,i) => (
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
            <h3 className="hd-aside-title">{lang==='ar' ? 'هدافو الدوري' : 'Top scorers'}</h3>
            <ol className="hd-scorers">
              <li><span>1</span><strong>{lang==='ar'?'كريستيانو رونالدو':'Cristiano Ronaldo'}</strong><em>22</em></li>
              <li><span>2</span><strong>{lang==='ar'?'ميتروفيتش':'Mitrović'}</strong><em>19</em></li>
              <li><span>3</span><strong>{lang==='ar'?'سالم الدوسري':'Salem Al-Dawsari'}</strong><em>14</em></li>
              <li><span>4</span><strong>{lang==='ar'?'بنزيمة':'Benzema'}</strong><em>12</em></li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ArticleView({ lang, article, setRoute }) {
  if (!article) { setRoute('home'); return null; }
  return (
    <article className="hd-article-page">
      <div className="hd-article-hero">
        <img src={article.image} alt=""/>
        <div className="hd-article-hero-scrim"/>
      </div>
      <div className="hd-container hd-article-grid">
        <div className="hd-article-body">
          <button className="hd-back" onClick={() => setRoute('home')}>
            <HdIcon name={lang==='ar'?'chevron':'chevronL'} size={16}/>
            {lang==='ar' ? 'العودة' : 'Back'}
          </button>
          <div className="hd-kicker">{t(article.kicker, lang)}</div>
          <h1 className="hd-article-title">{t(article.title, lang)}</h1>
          <div className="hd-article-meta">
            <span>{lang==='ar' ? 'بقلم سعد العتيبي' : 'By Saad Al-Otaibi'}</span>
            <span aria-hidden>·</span>
            <span>{lang==='ar' ? 'قبل ساعتين' : '2h ago'}</span>
            <span aria-hidden>·</span>
            <span>{lang==='ar' ? '٤ دقائق قراءة' : '4 min read'}</span>
            <div className="hd-article-actions">
              <button className="hd-icon-btn"><HdIcon name="bookmark" size={18}/></button>
              <button className="hd-icon-btn"><HdIcon name="share" size={18}/></button>
            </div>
          </div>
          {(article.body ? t(article.body, lang) : []).map((p,i) => (
            <p key={i} className="hd-article-p">{p}</p>
          ))}
          <div className="hd-pullquote">
            {lang==='ar' ? 'هذا ليس فوزًا عاديًا — هذا فصل جديد في تاريخ الديربي.'
                         : 'This isn\'t just a win — it\'s a new chapter in the derby.'}
          </div>
          {(article.body ? t(article.body, lang) : []).slice(0,1).map((p,i) => (
            <p key={i} className="hd-article-p">{p}</p>
          ))}
        </div>
        <aside className="hd-aside">
          <HdAdSlot size="300x600"/>
        </aside>
      </div>
    </article>
  );
}

function App() {
  const [lang, setLang] = useState('ar');
  const [route, setRoute] = useState('home');
  const [article, setArticle] = useState(null);
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
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

  const openArticle = (a) => { setArticle(a); setRoute('article'); window.scrollTo(0,0); };

  return (
    <div className="hd-app">
      <HdNav lang={lang} setLang={setLang} route={route} setRoute={setRoute} theme={theme} setTheme={setTheme}/>
      {route === 'home' && <HomeView lang={lang} setRoute={setRoute} openArticle={openArticle}/>}
      {route === 'league' && <LeagueView lang={lang} setRoute={setRoute}/>}
      {route === 'article' && <ArticleView lang={lang} article={article} setRoute={setRoute}/>}
      {(route === 'ucl' || route === 'wc' || route === 'video') && (
        <div className="hd-empty hd-container">
          <h2>{lang==='ar' ? 'قريبًا' : 'Coming soon'}</h2>
          <p>{lang==='ar' ? 'هذه الصفحة قيد التحضير.' : 'This section is under construction.'}</p>
        </div>
      )}
      <HdFooter lang={lang}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
