/* global React */

function LiveTicker({ matches, lang, onMatchClick }) {
  return (
    <div className="hd-ticker">
      <div className="hd-ticker-label">
        <span className="hd-pulse-dot"/>
        {lang==='ar' ? 'مباشر الآن' : 'LIVE NOW'}
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

function AdSlot({ size = '300x250', label = 'AD' }) {
  const [w, h] = size.split('x').map(Number);
  return (
    <div className="hd-ad" style={{ width: w, height: h }}>
      <span>{label}</span>
      <small>{size}</small>
    </div>
  );
}

function Footer({ lang }) {
  return (
    <footer className="hd-footer">
      <div className="hd-footer-inner">
        <div className="hd-footer-brand">
          <img src="assets/logo/hadaf-wordmark-dark.svg" alt="Hadaf"/>
          <p>{lang==='ar'
            ? 'هدف — أخبار كرة القدم العربية والعالمية بصوت عربي.'
            : 'Hadaf — Arab and global football news, in an Arab voice.'}</p>
        </div>
        <div className="hd-footer-cols">
          <div>
            <h5>{lang==='ar' ? 'البطولات' : 'Competitions'}</h5>
            <ul>
              <li>{lang==='ar' ? 'دوري روشن' : 'Saudi League'}</li>
              <li>{lang==='ar' ? 'دوري الأبطال' : 'Champions League'}</li>
              <li>{lang==='ar' ? 'البريميرليغ' : 'Premier League'}</li>
              <li>{lang==='ar' ? 'الليغا' : 'La Liga'}</li>
            </ul>
          </div>
          <div>
            <h5>{lang==='ar' ? 'هدف' : 'Hadaf'}</h5>
            <ul>
              <li>{lang==='ar' ? 'من نحن' : 'About'}</li>
              <li>{lang==='ar' ? 'تواصل' : 'Contact'}</li>
              <li>{lang==='ar' ? 'إعلن معنا' : 'Advertise'}</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="hd-footer-base">
        <span>© ٢٠٢٦ هدف · Hadaf</span>
        <span>{lang==='ar' ? 'كل الحقوق محفوظة' : 'All rights reserved'}</span>
      </div>
    </footer>
  );
}

window.HdLiveTicker = LiveTicker;
window.HdAdSlot = AdSlot;
window.HdFooter = Footer;
