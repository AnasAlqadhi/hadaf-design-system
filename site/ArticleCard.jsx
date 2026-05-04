/* global React */

function ArticleCard({ kicker, title, image, time, readMin, variant = 'standard', onClick, lang, url }) {
  // Use <a> for external links (better SEO + accessibility), <article> for internal
  const Tag = url ? 'a' : 'article';
  const linkProps = url
    ? { href: url, target: '_blank', rel: 'noopener noreferrer', onClick }
    : { onClick, tabIndex: 0, role: 'button' };

  if (variant === 'feature') {
    return (
      <Tag className="hd-art hd-art-feature" {...linkProps}>
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
      </Tag>
    );
  }
  if (variant === 'compact') {
    return (
      <Tag className="hd-art hd-art-compact" {...linkProps}>
        <div className="hd-art-body">
          <div className="hd-kicker">{kicker}</div>
          <h3 className="hd-art-title">{title}</h3>
          <div className="hd-art-meta"><span>{time}</span></div>
        </div>
        <div className="hd-art-img">
          {image && <img src={image} alt="" loading="lazy"/>}
        </div>
      </Tag>
    );
  }
  return (
    <Tag className="hd-art hd-art-standard" {...linkProps}>
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
    </Tag>
  );
}

window.HdArticleCard = ArticleCard;

