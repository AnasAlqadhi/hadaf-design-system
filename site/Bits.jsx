/* global React */
const { useState, useEffect, useRef } = React;

/* ========== LIVE TICKER ========== */
function LiveTicker({ matches, lang, onMatchClick }) {
  if (!matches || !matches.length) return null;
  return (
    <div className="hd-ticker">
      <div className="hd-ticker-label">
        <span className="hd-pulse-dot"/>
        {lang === 'ar' ? 'مباشر الآن' : 'LIVE NOW'}
      </div>
      <div className="hd-ticker-rail">
        {matches.map((m, i) => (
          <button key={i} className="hd-ticker-item" onClick={() => onMatchClick && onMatchClick(m)}>
            <img src={m.home.crest} alt=""/>
            <span className="hd-ticker-score">{m.scoreHome}–{m.scoreAway}</span>
            <img src={m.away.crest} alt=""/>
            <span className="hd-ticker-min">{m.minute}'</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ========== BREAKING NEWS BAR ========== */
function BreakingBar({ items, lang }) {
  if (!items || !items.length) return null;
  const doubled = [...items, ...items];
  return (
    <div className="hd-breaking" role="marquee" aria-label={lang === 'ar' ? 'أخبار عاجلة' : 'Breaking news'}>
      <div className="hd-breaking-label">
        <span className="hd-pulse-dot"/>
        {lang === 'ar' ? 'عاجل' : 'BREAKING'}
      </div>
      <div className="hd-breaking-scroll">
        <div className="hd-breaking-track">
          {doubled.map((item, i) => (
            <span key={i} className="hd-breaking-item">{typeof item === 'object' ? (item[lang] || item.ar) : item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========== AD SLOT ========== */
function AdSlot({ size = '300x250', label = 'AD' }) {
  const [w, h] = size.split('x').map(Number);
  return (
    <div className="hd-ad" style={{ maxWidth: w, height: h, width: '100%' }}>
      <span>{label}</span>
      <small>{size}</small>
    </div>
  );
}

/* ========== MOST READ ========== */
function MostRead({ articles, lang, onArticleClick }) {
  if (!articles || !articles.length) return null;
  return (
    <ol className="hd-most-read" aria-label={lang === 'ar' ? 'الأكثر قراءة' : 'Most read'}>
      {articles.map((a, i) => {
        const title = typeof a.title === 'object' ? (a.title[lang] || a.title.ar || a.title.en) : a.title;
        const time  = typeof a.time === 'object'  ? (a.time[lang]  || a.time.ar  || a.time.en)  : a.time;
        const Wrapper = a.url ? 'a' : 'li';
        const wProps = a.url
          ? { href: a.url, target: '_blank', rel: 'noopener noreferrer' }
          : { onClick: () => onArticleClick && onArticleClick(a) };
        return (
          <Wrapper key={i} className="hd-most-read-item" style={{display:'grid',gridTemplateColumns:'28px 1fr',gap:'10px',alignItems:'start',padding:'10px 0',borderBottom:'1px solid var(--border)',cursor:'pointer',textDecoration:'none',color:'inherit',listStyle:'none'}} {...wProps}>
            <span className="hd-mr-num">{i + 1}</span>
            <div>
              <div className="hd-mr-title">{title}</div>
              {time && <div className="hd-mr-time">{time}</div>}
            </div>
          </Wrapper>
        );
      })}
    </ol>
  );
}

/* ========== SKELETON CARD ========== */
function SkeletonCard({ variant = 'feature' }) {
  if (variant === 'standard') {
    return (
      <div className="hd-art hd-art-standard" style={{pointerEvents:'none'}}>
        <div className="hd-art-img hd-skel" style={{aspectRatio:'4/3', maxHeight:160}}/>
        <div className="hd-skel-body">
          <div className="hd-skel hd-skel-line-sm" style={{marginBottom:6}}/>
          <div className="hd-skel hd-skel-line-title" style={{marginBottom:4}}/>
          <div className="hd-skel hd-skel-line-title-2"/>
          <div className="hd-skel hd-skel-line-meta" style={{marginTop:8}}/>
        </div>
      </div>
    );
  }
  return (
    <div className="hd-skel-card" style={{pointerEvents:'none'}}>
      <div className="hd-skel hd-skel-img"/>
      <div className="hd-skel-body">
        <div className="hd-skel hd-skel-line-sm" style={{marginBottom:6}}/>
        <div className="hd-skel hd-skel-line-title" style={{marginBottom:4}}/>
        <div className="hd-skel hd-skel-line-title-2"/>
        <div className="hd-skel hd-skel-line-meta" style={{marginTop:8}}/>
      </div>
    </div>
  );
}

/* ========== FOOTER ========== */
function Footer({ lang, setRoute }) {
  const comps = lang === 'ar'
    ? [['league','دوري روشن'],['ucl','أبطال أوروبا'],['scores','النتائج والمباريات'],['transfers','سوق الانتقالات']]
    : [['league','Saudi League'],['ucl','Champions League'],['scores','Scores & Fixtures'],['transfers','Transfer Market']];

  const social = [
    { label: 'X / Twitter', href: '#', icon: 'x' },
    { label: 'Instagram',   href: '#', icon: 'ig' },
    { label: 'YouTube',     href: '#', icon: 'yt' },
    { label: 'TikTok',      href: '#', icon: 'tt' },
  ];

  function SocialIcon({ name }) {
    const paths = {
      x:  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25z"/>,
      ig: <><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></>,
      yt: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></>,
      tt: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>,
    };
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </svg>
    );
  }

  return (
    <footer className="hd-footer">
      <div className="hd-footer-inner">
        <div className="hd-footer-brand">
          <img src="assets/logo/hadaf-wordmark.png" alt="هدف Hadaf"/>
          <p style={{marginTop:12}}>{lang === 'ar'
            ? 'هدف — أخبار كرة القدم العربية والعالمية بصوت عربي. غطاء شامل لدوري روشن السعودي وأبطال أوروبا والبطولات الكبرى.'
            : 'Hadaf — Arab and global football news, in an Arab voice. Comprehensive coverage of the Saudi Pro League, Champions League, and major tournaments.'}</p>
          <div style={{display:'flex',gap:10,marginTop:18}}>
            {social.map(s => (
              <a
                key={s.icon}
                href={s.href}
                aria-label={s.label}
                style={{
                  width:36, height:36, borderRadius:'50%',
                  background:'rgba(255,255,255,0.08)',
                  border:'1px solid rgba(255,255,255,0.12)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'rgba(245,241,232,0.7)',
                  transition:'all 120ms',
                  textDecoration:'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--hadaf-green)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='var(--hadaf-green)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(245,241,232,0.7)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; }}
              >
                <SocialIcon name={s.icon}/>
              </a>
            ))}
          </div>
        </div>
        <div className="hd-footer-cols">
          <div>
            <h5>{lang === 'ar' ? 'البطولات' : 'Competitions'}</h5>
            <ul>
              {comps.map(([k, label]) => (
                <li key={k} onClick={() => setRoute && setRoute(k)} style={{cursor:'pointer'}}>{label}</li>
              ))}
            </ul>
          </div>
          <div>
            <h5>{lang === 'ar' ? 'هدف' : 'Hadaf'}</h5>
            <ul>
              <li>{lang === 'ar' ? 'من نحن' : 'About us'}</li>
              <li>{lang === 'ar' ? 'تواصل معنا' : 'Contact'}</li>
              <li>{lang === 'ar' ? 'إعلن معنا' : 'Advertise'}</li>
              <li>{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="hd-footer-base">
        <span>© ٢٠٢٦ هدف · Hadaf</span>
        <span>{lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</span>
        <DataStatus lang={lang}/>
      </div>
    </footer>
  );
}

/* ========== MATCH DAY CARD ========== */
function MatchDayCard({ match, lang, onViewClick }) {
  if (!match) return null;
  const home = match.home;
  const away = match.away;
  const homeName = typeof home.ar === 'string' ? (lang === 'ar' ? home.ar : home.en) : (home.name || '');
  const awayName = typeof away.ar === 'string' ? (lang === 'ar' ? away.ar : away.en) : (away.name || '');
  const isLive = match.status === 'live';

  return (
    <div className="hd-matchday-card">
      <div className="hd-matchday-inner">
        <div className="hd-matchday-label">
          {isLive ? <><span className="hd-pulse-dot"/>{lang === 'ar' ? 'مباشر الآن' : 'LIVE NOW'}</> : (lang === 'ar' ? 'مباراة اليوم' : "TODAY'S MATCH")}
        </div>
        <div className="hd-matchday-teams">
          <div className="hd-matchday-team">
            <img className="hd-matchday-crest" src={home.crest || 'assets/crests/team-blue.svg'} alt={homeName}/>
            <div className="hd-matchday-name">{homeName}</div>
          </div>
          <div className="hd-matchday-score-center">
            {isLive || match.status === 'ft' ? (
              <>
                <div className="hd-matchday-score-val">
                  <span>{match.scoreHome}</span>
                  <span className="hd-matchday-score-sep">–</span>
                  <span>{match.scoreAway}</span>
                </div>
                <div className="hd-matchday-score-time" style={{color: isLive ? '#E03131' : 'rgba(255,255,255,0.5)'}}>
                  {isLive ? `${match.minute}'` : (lang === 'ar' ? 'نهاية' : 'FT')}
                </div>
              </>
            ) : (
              <>
                <div className="hd-matchday-score-val" style={{fontSize:24, color:'rgba(255,255,255,0.7)'}}>
                  {lang === 'ar' ? 'ضد' : 'VS'}
                </div>
                <div className="hd-matchday-score-time">{match.time || match.minute}</div>
              </>
            )}
          </div>
          <div className="hd-matchday-team hd-matchday-team-2">
            <img className="hd-matchday-crest" src={away.crest || 'assets/crests/team-red.svg'} alt={awayName}/>
            <div className="hd-matchday-name">{awayName}</div>
          </div>
        </div>
        <div className="hd-matchday-actions">
          <button className="hd-matchday-btn primary" onClick={onViewClick}>
            {lang === 'ar' ? 'تفاصيل المباراة' : 'Match details'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== DATA STATUS CHIP ========== */
// Tiny indicator showing freshness of API data (live / cached / stale / mock).
// Subscribes to window.HadafCache so it refreshes automatically.
function DataStatus({ lang }) {
  const [status, setStatus] = useState({ source: null, state: 'idle', age: 0 });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!window.HadafCache) return;
    const update = () => setStatus(window.HadafCache.worstStatus());
    update();
    const unsub = window.HadafCache.subscribe(update);
    // re-tick every 30s so "Xm ago" stays accurate
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => { unsub(); clearInterval(interval); };
  }, []);

  if (status.state === 'idle') return null;

  const ageMin = Math.floor(status.age / 60000);
  const ageSec = Math.floor(status.age / 1000);
  const ageStr = ageMin >= 1
    ? (lang === 'ar' ? `قبل ${ageMin}د` : `${ageMin}m ago`)
    : (lang === 'ar' ? `قبل ${ageSec || 0}ث` : `${ageSec || 0}s ago`);

  const labels = {
    live:   lang === 'ar' ? 'مباشر'    : 'Live',
    cached: lang === 'ar' ? 'مخزّن'    : 'Cached',
    stale:  lang === 'ar' ? 'قديم'      : 'Stale',
    down:   lang === 'ar' ? 'غير متاح' : 'Offline',
  };

  return (
    <div className={`hd-data-status hd-ds-${status.state}`} title={status.source || ''}>
      <span className="hd-ds-dot"/>
      <span className="hd-ds-label">{labels[status.state] || status.state}</span>
      {status.state !== 'live' && status.age > 0 && status.age < Infinity && (
        <span className="hd-ds-age">· {ageStr}</span>
      )}
      <span className="hd-ds-tick" style={{display:'none'}}>{tick}</span>
    </div>
  );
}

window.HdLiveTicker  = LiveTicker;
window.HdBreakingBar = BreakingBar;
window.HdAdSlot      = AdSlot;
window.HdMostRead    = MostRead;
window.HdSkeleton    = SkeletonCard;
window.HdFooter      = Footer;
window.HdMatchDayCard = MatchDayCard;
window.HdDataStatus  = DataStatus;
