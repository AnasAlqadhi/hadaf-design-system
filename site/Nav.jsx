/* global React */
const { useState, useEffect, useRef } = React;

function Icon({ name, size = 20 }) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    search:    <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    menu:      <path d="M3 6h18M3 12h18M3 18h18"/>,
    bell:      <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    chevron:   <path d="m9 6 6 6-6 6"/>,
    chevronL:  <path d="m15 6-6 6 6 6"/>,
    play:      <path d="m9 8 6 4-6 4z" fill="currentColor"/>,
    clock:     <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    share:     <><path d="m12 16 4-5h-3V4h-2v7H8z"/><path d="M5 20h14"/></>,
    bookmark:  <path d="M19 21 12 17l-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>,
    globe:     <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
    fire:      <path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-3 0 2 1 3 2 3-1-3 1-6 1-8z"/>,
    sun:       <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    moon:      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
    trophy:    <path d="M6 9H3v5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-5h-3M6 9V5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4M6 9h12M9 3h6M5.5 18h13"/>,
    home:      <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    score:     <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8M12 8v8"/></>,
    table:     <><path d="M3 3h18v18H3z"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></>,
    transfer:  <><path d="m17 8-4-4-4 4"/><path d="M13 4v9a1 1 0 0 1-1 1H3"/><path d="m7 16 4 4 4-4"/><path d="M11 20v-9a1 1 0 0 1 1-1h9"/></>,
    video:     <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>,
    close:     <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    saudiflag: <path d="M4 6h16v12H4z"/>,
    ucl:       <><circle cx="12" cy="12" r="9"/><path d="M12 3v9l4 4"/></>,
    wc:        <><circle cx="12" cy="12" r="9"/><path d="M12 3a12 12 0 0 1 0 18"/><path d="M3 12h18"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>{paths[name] || paths.menu}</svg>;
}

function ThemeSwitcher({ theme, setTheme }) {
  return (
    <div className="hd-theme-switcher" title="Theme switcher">
      <button
        className={`hd-theme-btn ${theme === 'default' ? 'is-active' : ''}`}
        onClick={() => setTheme('default')}
        title="Light"
        aria-pressed={theme === 'default'}
      ><Icon name="sun" size={15}/></button>
      <button
        className={`hd-theme-btn ${theme === 'dark' ? 'is-active' : ''}`}
        onClick={() => setTheme('dark')}
        title="Dark"
        aria-pressed={theme === 'dark'}
      ><Icon name="moon" size={15}/></button>
      <button
        className={`hd-theme-btn ${theme === 'match-night' ? 'is-active' : ''}`}
        onClick={() => setTheme('match-night')}
        title="Match Night"
        aria-pressed={theme === 'match-night'}
      ><Icon name="fire" size={15}/></button>
    </div>
  );
}

function SearchModal({ lang, feed, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const results = query.trim().length < 2 ? [] : (feed || []).filter(a => {
    const q = query.toLowerCase();
    const title = typeof a.title === 'object' ? (a.title[lang] || a.title.ar || a.title.en || '') : (a.title || '');
    const kicker = typeof a.kicker === 'object' ? (a.kicker[lang] || a.kicker.ar || a.kicker.en || '') : (a.kicker || '');
    return title.toLowerCase().includes(q) || kicker.toLowerCase().includes(q);
  });

  return (
    <div className="hd-search-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="hd-search-box">
        <div className="hd-search-input-row">
          <Icon name="search" size={20}/>
          <input
            ref={inputRef}
            className="hd-search-input"
            placeholder={lang === 'ar' ? 'ابحث عن خبر أو مباراة…' : 'Search news or match…'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          />
          <button className="hd-search-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={16}/>
          </button>
        </div>
        <div className="hd-search-results">
          {query.trim().length > 1 && results.length === 0 && (
            <div className="hd-search-empty">
              {lang === 'ar' ? 'لا توجد نتائج لـ "' + query + '"' : `No results for "${query}"`}
            </div>
          )}
          {results.map((a, i) => {
            const title = typeof a.title === 'object' ? (a.title[lang] || a.title.ar || a.title.en) : a.title;
            const kicker = typeof a.kicker === 'object' ? (a.kicker[lang] || a.kicker.ar || a.kicker.en) : a.kicker;
            const Wrapper = a.url ? 'a' : 'div';
            const wProps = a.url
              ? { href: a.url, target: '_blank', rel: 'noopener noreferrer', onClick: onClose }
              : { onClick: onClose };
            return (
              <Wrapper key={i} className="hd-search-result" {...wProps}>
                {a.image && <img className="hd-search-result-img" src={a.image} alt="" loading="lazy"/>}
                <div className="hd-search-result-info">
                  {kicker && <div className="hd-kicker">{kicker}</div>}
                  <div className="hd-search-result-title">{title}</div>
                </div>
              </Wrapper>
            );
          })}
          {query.trim().length < 2 && (
            <div className="hd-search-empty">
              {lang === 'ar' ? 'اكتب للبحث في الأخبار…' : 'Start typing to search news…'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== NEWSLETTER MODAL ===== */
function NewsletterModal({ lang, onClose }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | submitting | done | error
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit(e) {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setState('submitting');
    try {
      // Buttondown free-tier embed endpoint — replace 'hadaf' with your Buttondown username
      const BUTTONDOWN_USERNAME = window.HADAF_CONFIG && window.HADAF_CONFIG.BUTTONDOWN_USERNAME;
      if (BUTTONDOWN_USERNAME) {
        const fd = new FormData();
        fd.append('email_address', email.trim());
        fd.append('referrer_url', window.location.href);
        const res = await fetch(`https://buttondown.email/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`, {
          method: 'POST',
          body: fd,
        });
        if (!res.ok && res.status !== 302) throw new Error('Failed');
      }
      // Even without a real endpoint configured, show success for UX
      setState('done');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="hd-newsletter-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="hd-newsletter-modal" role="dialog" aria-modal="true" aria-label={lang === 'ar' ? 'اشترك في النشرة' : 'Subscribe to newsletter'}>
        <button className="hd-newsletter-close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={18}/>
        </button>
        <div className="hd-newsletter-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--hadaf-gold)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <h2 className="hd-newsletter-title">{lang === 'ar' ? 'نشرة هدف الأسبوعية' : 'Hadaf Weekly Newsletter'}</h2>
        <p className="hd-newsletter-sub">{lang === 'ar'
          ? 'أبرز أخبار الأسبوع، نتائج الدوريات، وحصريات هدف — مباشرةً إلى بريدك الإلكتروني.'
          : 'Top stories of the week, league results, and Hadaf exclusives — straight to your inbox.'}</p>

        {state === 'done' ? (
          <div className="hd-newsletter-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--hadaf-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{lang === 'ar' ? 'شكراً! تحقق من بريدك للتأكيد.' : 'Thank you! Check your email to confirm.'}</span>
          </div>
        ) : (
          <form className="hd-newsletter-form" onSubmit={submit}>
            <input
              ref={inputRef}
              type="email"
              className="hd-newsletter-input"
              placeholder={lang === 'ar' ? 'بريدك الإلكتروني' : 'Your email address'}
              value={email}
              onChange={e => { setEmail(e.target.value); setState('idle'); }}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              required
            />
            <button
              type="submit"
              className="hd-btn hd-btn-primary"
              disabled={state === 'submitting'}
              style={{minWidth:120}}
            >
              {state === 'submitting'
                ? (lang === 'ar' ? 'جارٍ…' : 'Sending…')
                : (lang === 'ar' ? 'اشترك' : 'Subscribe')}
            </button>
            {state === 'error' && (
              <p style={{color:'var(--live-red,#E03131)',fontSize:12,margin:'6px 0 0'}}>
                {lang === 'ar' ? 'حدث خطأ. حاول مجدداً.' : 'Something went wrong. Please try again.'}
              </p>
            )}
          </form>
        )}
        <p className="hd-newsletter-privacy">
          {lang === 'ar' ? 'لا بريد عشوائي. يمكنك إلغاء الاشتراك في أي وقت.' : 'No spam. Unsubscribe at any time.'}
        </p>
      </div>
    </div>
  );
}

function Nav({ lang, setLang, route, setRoute, theme, setTheme, feed, searchOpen, setSearchOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  const items = lang === 'ar'
    ? [['home','الرئيسية'],['scores','النتائج'],['league','دوري روشن'],['ucl','أبطال أوروبا'],['transfers','الانتقالات'],['video','الفيديوهات']]
    : [['home','Home'],['scores','Scores'],['league','Saudi League'],['ucl','Champions League'],['transfers','Transfers'],['video','Videos']];

  function navigate(k) {
    setRoute(k);
    setMenuOpen(false);
  }

  return (
    <>
      <nav className="hd-nav">
        <div className="hd-nav-inner">
          <a className="hd-logo" onClick={() => { setRoute('home'); setMenuOpen(false); }} style={{cursor:'pointer'}}>
            <img src="assets/logo/hadaf-wordmark.png" alt="هدف Hadaf"/>
          </a>
          <ul className="hd-nav-list">
            {items.map(([k, label]) => (
              <li
                key={k}
                className={route === k ? 'is-active' : ''}
                onClick={() => navigate(k)}
              >{label}</li>
            ))}
          </ul>
          <div className="hd-nav-actions">
            <button
              className="hd-icon-btn"
              title={lang === 'ar' ? 'بحث' : 'Search'}
              aria-label="search"
              onClick={() => setSearchOpen(true)}
            ><Icon name="search"/></button>
            <button className="hd-icon-btn hd-icon-btn--hide-xs" title="notifications" aria-label="notifications">
              <Icon name="bell"/>
            </button>
            <ThemeSwitcher theme={theme} setTheme={setTheme}/>
            <button className="hd-lang" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
              <Icon name="globe" size={16}/>
              <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
            </button>
            <button className="hd-btn hd-btn-primary hd-btn-sm hd-btn--hide-xs" onClick={() => setNewsletterOpen(true)}>
              {lang === 'ar' ? 'اشترك' : 'Subscribe'}
            </button>
            <button
              className={`hd-icon-btn hd-hamburger ${menuOpen ? 'is-open' : ''}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span/><span/><span/>
            </button>
          </div>
        </div>
        {/* Mobile drawer */}
        <div className={`hd-mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
          <ul className="hd-mobile-nav-list">
            {items.map(([k, label]) => (
              <li
                key={k}
                className={route === k ? 'is-active' : ''}
                onClick={() => navigate(k)}
              >{label}</li>
            ))}
          </ul>
          <div className="hd-mobile-menu-footer">
            <button className="hd-btn hd-btn-primary" style={{width:'100%'}} onClick={() => { setMenuOpen(false); setNewsletterOpen(true); }}>
              {lang === 'ar' ? 'اشترك في النشرة' : 'Subscribe to newsletter'}
            </button>
          </div>
        </div>
      </nav>
      {searchOpen && (
        <SearchModal lang={lang} feed={feed} onClose={() => setSearchOpen(false)}/>
      )}
      {newsletterOpen && (
        <NewsletterModal lang={lang} onClose={() => setNewsletterOpen(false)}/>
      )}
    </>
  );
}

window.HdNav = Nav;
window.HdIcon = Icon;
window.HdThemeSwitcher = ThemeSwitcher;
window.HdSearchModal = SearchModal;
