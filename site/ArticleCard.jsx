/* global React */

function ArticleCard({ kicker, title, image, time, readMin, variant = 'standard', onClick, lang }) {
  if (variant === 'feature') {
    return (
      <article className="hd-art hd-art-feature" onClick={onClick} tabIndex={0} role="button">
        <div className="hd-art-img">
          {image && <img src={image} alt="" loading="lazy"/>}
          <div className="hd-art-img-scrim"/>
        </div>
        <div className="hd-art-body">
          <div className="hd-kicker">{kicker}</div>
          <h2 className="hd-art-title">{title}</h2>
          <div className="hd-art-meta">
            <span>{time}</span>
            <span aria-hidden>·</span>
            <span>{readMin} {lang==='ar' ? 'دقائق قراءة' : 'min read'}</span>
          </div>
        </div>
      </article>
    );
  }
  if (variant === 'compact') {
    return (
      <article className="hd-art hd-art-compact" onClick={onClick} tabIndex={0} role="button">
        <div className="hd-art-body">
          <div className="hd-kicker">{kicker}</div>
          <h3 className="hd-art-title">{title}</h3>
          <div className="hd-art-meta"><span>{time}</span></div>
        </div>
        <div className="hd-art-img">
          {image && <img src={image} alt="" loading="lazy"/>}
        </div>
      </article>
    );
  }
  return (
    <article className="hd-art hd-art-standard" onClick={onClick} tabIndex={0} role="button">
      <div className="hd-art-img">
        {image && <img src={image} alt="" loading="lazy"/>}
      </div>
      <div className="hd-art-body">
        <div className="hd-kicker">{kicker}</div>
        <h3 className="hd-art-title">{title}</h3>
        <div className="hd-art-meta">
          <span>{time}</span>
          <span aria-hidden>·</span>
          <span>{readMin} {lang==='ar' ? 'دقائق' : 'min'}</span>
        </div>
      </div>
    </article>
  );
}

window.HdArticleCard = ArticleCard;

