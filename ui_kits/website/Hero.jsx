/* global React */

function Hero({ kicker, title, image, lang, onClick }) {
  return (
    <section className="hd-hero" onClick={onClick}>
      <img className="hd-hero-bg" src={image} alt=""/>
      <div className="hd-hero-scrim"/>
      <div className="hd-hero-content">
        <div className="hd-kicker">{kicker}</div>
        <h1 className="hd-hero-title">{title}</h1>
        <div className="hd-hero-meta">
          <span>{lang==='ar' ? 'بقلم سعد العتيبي' : 'By Saad Al-Otaibi'}</span>
          <span aria-hidden>·</span>
          <span>{lang==='ar' ? 'قبل ساعتين' : '2h ago'}</span>
        </div>
      </div>
    </section>
  );
}

window.HdHero = Hero;
