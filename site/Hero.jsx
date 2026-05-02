/* global React */

function Hero({ kicker, title, image, lang, onClick }) {
  return (
    <section className="hd-hero" onClick={onClick} role="article" aria-label={title}>
      <img className="hd-hero-bg" src={image} alt=""/>
      <div className="hd-hero-scrim"/>
      <div className="hd-hero-content">
        <div className="hd-hero-kicker">
          <span className="hd-pulse-dot"/>
          {kicker}
        </div>
        <h1 className="hd-hero-title">{title}</h1>
        <div className="hd-hero-footer">
          <div className="hd-hero-meta">
            <span>{lang==='ar' ? 'بقلم سعد العتيبي' : 'By Saad Al-Otaibi'}</span>
            <span aria-hidden>·</span>
            <span>{lang==='ar' ? 'قبل ساعتين' : '2h ago'}</span>
            <span aria-hidden>·</span>
            <span>{lang==='ar' ? '٤ دق قراءة' : '4 min read'}</span>
          </div>
          <button
            className="hd-hero-read"
            onClick={e => { e.stopPropagation(); onClick && onClick(); }}
          >
            {lang==='ar' ? 'اقرأ المقال ←' : 'Read story →'}
          </button>
        </div>
      </div>
    </section>
  );
}

window.HdHero = Hero;
