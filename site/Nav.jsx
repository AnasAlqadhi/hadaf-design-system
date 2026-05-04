/* global React */
const { useState } = React;

function Icon({ name, size = 20 }) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    menu: <path d="M3 6h18M3 12h18M3 18h18"/>,
    bell: <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    chevron: <path d="m9 6 6 6-6 6"/>,
    chevronL: <path d="m15 6-6 6 6 6"/>,
    play: <path d="m9 8 6 4-6 4z" fill="currentColor"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    share: <><path d="m12 16 4-5h-3V4h-2v7H8z"/><path d="M5 20h14"/></>,
    bookmark: <path d="M19 21 12 17l-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
    fire: <path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-3 0 2 1 3 2 3-1-3 1-6 1-8z"/>,
    sun: <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
    trophy: <path d="M6 9H3v5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-5h-3M6 9V5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4M6 9h12M9 3h6M5.5 18h13"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>{paths[name]}</svg>;
}

function ThemeSwitcher({ theme, setTheme }) {
  return (
    <div className="hd-theme-switcher" title="Theme switcher">
      <button 
        className={`hd-theme-btn ${theme === 'default' ? 'is-active' : ''}`}
        onClick={() => setTheme('default')}
        title="Light"
        aria-pressed={theme === 'default'}
      >
        <Icon name="sun" size={15}/>
      </button>
      <button 
        className={`hd-theme-btn ${theme === 'dark' ? 'is-active' : ''}`}
        onClick={() => setTheme('dark')}
        title="Dark"
        aria-pressed={theme === 'dark'}
      >
        <Icon name="moon" size={15}/>
      </button>
      <button 
        className={`hd-theme-btn ${theme === 'match-night' ? 'is-active' : ''}`}
        onClick={() => setTheme('match-night')}
        title="Match Night"
        aria-pressed={theme === 'match-night'}
      >
        <Icon name="fire" size={15}/>
      </button>
    </div>
  );
}

function Nav({ lang, setLang, route, setRoute, theme, setTheme }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const items = lang === 'ar'
    ? [['home','الرئيسية'],['scores','النتائج'],['saudi','دوري روشن'],['ucl','أبطال أوروبا'],['wc','كأس العالم'],['video','الفيديوهات']]
    : [['home','Home'],['scores','Scores'],['saudi','Saudi League'],['ucl','Champions League'],['wc','World Cup'],['video','Videos']];

  function navigate(k) {
    setRoute(k === 'saudi' ? 'league' : k);
    setMenuOpen(false);
  }

  return (
    <nav className="hd-nav">
      <div className="hd-nav-inner">
        <a className="hd-logo" onClick={() => { setRoute('home'); setMenuOpen(false); }}>
          <img src="assets/logo/hadaf-wordmark.png" alt="هدف Hadaf"/>
        </a>
        <ul className="hd-nav-list">
          {items.map(([k,label]) => (
            <li key={k} className={route === k || (k==='saudi' && route==='league') ? 'is-active' : ''}
                onClick={() => navigate(k)}>{label}</li>
          ))}
        </ul>
        <div className="hd-nav-actions">
          <button className="hd-icon-btn" title="search" aria-label="search"><Icon name="search"/></button>
          <button className="hd-icon-btn hd-icon-btn--hide-xs" title="notifications" aria-label="notifications"><Icon name="bell"/></button>
          <ThemeSwitcher theme={theme} setTheme={setTheme}/>
          <button className="hd-lang" onClick={() => setLang(lang==='ar'?'en':'ar')}>
            <Icon name="globe" size={16}/>
            <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
          </button>
          <button className="hd-btn hd-btn-primary hd-btn-sm hd-btn--hide-xs">{lang==='ar'?'اشترك':'Subscribe'}</button>
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
          {items.map(([k,label]) => (
            <li key={k} className={route === k || (k==='saudi' && route==='league') ? 'is-active' : ''}
                onClick={() => navigate(k)}>{label}</li>
          ))}
        </ul>
        <div className="hd-mobile-menu-footer">
          <button className="hd-btn hd-btn-primary" style={{width:'100%'}} onClick={() => setMenuOpen(false)}>
            {lang==='ar'?'اشترك في النشرة':'Subscribe to newsletter'}
          </button>
        </div>
      </div>
    </nav>
  );
}

window.HdNav = Nav;
window.HdIcon = Icon;
window.HdThemeSwitcher = ThemeSwitcher;
