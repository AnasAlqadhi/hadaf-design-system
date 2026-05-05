/* global React */
const { useState, useEffect, useRef, useCallback } = React;

function Hero({ slides, lang, onSlideClick }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  const count = slides ? slides.length : 0;

  const next = useCallback(() => {
    setActive(i => (i + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setActive(i => (i - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    timerRef.current = setInterval(next, 6000);
    return () => clearInterval(timerRef.current);
  }, [paused, next, count]);

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (lang === 'ar') {
      dx > 0 ? next() : prev();
    } else {
      dx < 0 ? next() : prev();
    }
  }

  if (!slides || !slides.length) return null;

  const slide = slides[active];

  return (
    <section
      className="hd-hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label={slide.title}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          className={`hd-hc-slide${i === active ? ' is-active' : ''}`}
          onClick={() => onSlideClick && onSlideClick(s)}
          role="article"
          aria-hidden={i !== active}
        >
          <img className="hd-hc-bg" src={s.image} alt=""/>
          <div className="hd-hc-scrim"/>
          <div className="hd-hc-content">
            <div className="hd-hc-kicker">
              <span className="hd-pulse-dot"/>
              {typeof s.kicker === 'object' ? (s.kicker[lang] || s.kicker.ar || s.kicker.en) : s.kicker}
            </div>
            <h1 className="hd-hc-title">
              {typeof s.title === 'object' ? (s.title[lang] || s.title.ar || s.title.en) : s.title}
            </h1>
            <div className="hd-hc-footer">
              <div className="hd-hc-meta">
                {s.author && <span>{s.author}</span>}
                {s.author && <span aria-hidden>·</span>}
                {s.time && <span>{typeof s.time === 'object' ? (s.time[lang] || s.time.ar) : s.time}</span>}
                {s.readMin && <span aria-hidden>·</span>}
                {s.readMin && <span>{s.readMin} {lang === 'ar' ? 'دق قراءة' : 'min read'}</span>}
              </div>
              <button
                className="hd-hc-read"
                onClick={e => { e.stopPropagation(); onSlideClick && onSlideClick(s); }}
              >
                {lang === 'ar' ? 'اقرأ المقال ←' : 'Read story →'}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Slide counter */}
      {count > 1 && (
        <div className="hd-hc-counter" aria-hidden="true">
          {active + 1} / {count}
        </div>
      )}

      {/* Arrow controls */}
      {count > 1 && (
        <div className="hd-hc-arrows" aria-hidden="true">
          <button
            className="hd-hc-arrow"
            onClick={e => { e.stopPropagation(); (lang === 'ar' ? next : prev)(); }}
            aria-label={lang === 'ar' ? 'التالي' : 'Previous'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button
            className="hd-hc-arrow"
            onClick={e => { e.stopPropagation(); (lang === 'ar' ? prev : next)(); }}
            aria-label={lang === 'ar' ? 'السابق' : 'Next'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6"/>
            </svg>
          </button>
        </div>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="hd-hc-dots" role="tablist" aria-label={lang === 'ar' ? 'مؤشر الشرائح' : 'Slide indicator'}>
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hd-hc-dot${i === active ? ' is-active' : ''}`}
              onClick={e => { e.stopPropagation(); setActive(i); }}
              role="tab"
              aria-selected={i === active}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

window.HdHero = Hero;
