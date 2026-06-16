/* global React */

function ArticleCard({ kicker, title, image, time, readMin, variant = 'standard', onClick, lang, url, external = true }) {
  // <a> for any link (better SEO + accessibility), <article> for in-app JS navigation.
  // external=true → open the source in a new tab; external=false → same-tab nav to our
  // own on-site article page (so internal links are crawlable and keep readers on Hadaf).
  const Tag = url ? 'a' : 'article';
  const linkProps = url
    ? (external
        ? { href: url, target: '_blank', rel: 'noopener noreferrer', onClick }
        : { href: url, onClick })
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

