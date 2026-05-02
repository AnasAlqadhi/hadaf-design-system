/* global React */

function MatchCard({ home, away, scoreHome, scoreAway, status, minute, lang, compact }) {
  const isLive = status === 'live';
  const isFinal = status === 'final';
  const isUpcoming = status === 'upcoming';
  return (
    <div className={`hd-match ${compact ? 'is-compact' : ''}`}>
      <div className="hd-match-team">
        <img src={home.crest} alt=""/>
        <span>{lang==='ar' ? home.ar : home.en}</span>
      </div>
      <div className="hd-match-center">
        {isUpcoming ? (
          <div className="hd-match-time">
            <div className="hd-match-time-h">{minute}</div>
            <div className="hd-match-status-up">{lang==='ar' ? 'اليوم' : 'Today'}</div>
          </div>
        ) : (
          <>
            <div className="hd-match-score">{scoreHome} <span>—</span> {scoreAway}</div>
            {isLive && (
              <div className="hd-match-live">
                <span className="hd-pulse-dot"/>
                {lang==='ar' ? `${minute}'` : `${minute}'`}
              </div>
            )}
            {isFinal && <div className="hd-match-final">{lang==='ar' ? 'انتهت' : 'FT'}</div>}
          </>
        )}
      </div>
      <div className="hd-match-team away">
        <img src={away.crest} alt=""/>
        <span>{lang==='ar' ? away.ar : away.en}</span>
      </div>
    </div>
  );
}

window.HdMatchCard = MatchCard;
