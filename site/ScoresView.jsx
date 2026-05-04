/* global React, HadafAPI */
const { useState, useEffect, useCallback } = React;

// Format ISO date string to HH:MM (Riyadh time)
function formatKickoff(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('ar-SA', {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Riyadh', hour12: false
  });
}

// Single match row inside a competition block
function MatchRow({ match, lang }) {
  const t = (ar, en) => lang === 'ar' ? ar : en;
  const isLive = match.isLive;
  const isFinished = match.isFinished;

  return (
    <div className={`hd-sr-row${isLive ? ' is-live' : ''}${isFinished ? ' is-done' : ''}`}>
      {/* Time / Status */}
      <div className="hd-sr-time">
        {isLive
          ? <span className="hd-sr-live-badge">{match.minute}'</span>
          : isFinished
            ? <span className="hd-sr-ft">{t('ن.م', 'FT')}</span>
            : <span>{formatKickoff(match.kickoff)}</span>
        }
      </div>

      {/* Home team */}
      <div className="hd-sr-team hd-sr-team--home">
        {match.homeTeam.logo && (
          <img className="hd-sr-crest" src={match.homeTeam.logo} alt="" loading="lazy"/>
        )}
        <span className="hd-sr-name">{match.homeTeam.name}</span>
      </div>

      {/* Score */}
      <div className="hd-sr-score">
        {(isLive || isFinished)
          ? <><span>{match.homeScore ?? 0}</span><span className="hd-sr-dash">-</span><span>{match.awayScore ?? 0}</span></>
          : <span className="hd-sr-vs">{t('ضد', 'vs')}</span>
        }
      </div>

      {/* Away team */}
      <div className="hd-sr-team hd-sr-team--away">
        <span className="hd-sr-name">{match.awayTeam.name}</span>
        {match.awayTeam.logo && (
          <img className="hd-sr-crest" src={match.awayTeam.logo} alt="" loading="lazy"/>
        )}
      </div>
    </div>
  );
}

// One competition block with its matches
function CompetitionBlock({ league, matches, lang }) {
  const [open, setOpen] = useState(true);
  const t = (ar, en) => lang === 'ar' ? ar : en;
  const leagueName = t(league.name.ar, league.name.en);

  return (
    <div className="hd-sr-block">
      <button className="hd-sr-league-header" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="hd-sr-league-name">{leagueName}</span>
        <span className="hd-sr-league-count">{matches.length}</span>
        <span className={`hd-sr-chevron${open ? '' : ' is-closed'}`}>›</span>
      </button>
      {open && (
        <div className="hd-sr-matches">
          {matches.map(m => <MatchRow key={m.id} match={m} lang={lang}/>)}
        </div>
      )}
    </div>
  );
}

// Date strip — Yesterday / Today / Tomorrow
function DateStrip({ selected, onSelect, lang }) {
  const t = (ar, en) => lang === 'ar' ? ar : en;
  const days = [
    { offset: -1, label: t('أمس', 'Yesterday') },
    { offset:  0, label: t('اليوم', 'Today') },
    { offset:  1, label: t('غداً', 'Tomorrow') },
  ];
  return (
    <div className="hd-date-strip">
      {days.map(d => (
        <button
          key={d.offset}
          className={`hd-date-btn${selected === d.offset ? ' is-active' : ''}`}
          onClick={() => onSelect(d.offset)}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

// Main Scores View
function ScoresView({ lang }) {
  const t = (ar, en) => lang === 'ar' ? ar : en;
  const [dayOffset, setDayOffset] = useState(0);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (offset) => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = HadafAPI.offsetDay(offset);
      const data = await HadafAPI.getFixturesByDate(dateStr);
      setBlocks(data);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(dayOffset); }, [dayOffset, load]);

  return (
    <div className="hd-scores-view">
      <DateStrip selected={dayOffset} onSelect={d => { setDayOffset(d); }} lang={lang}/>

      {loading && (
        <div className="hd-scores-state">
          <span className="hd-spinner"/>
          <span>{t('جارٍ التحميل…', 'Loading…')}</span>
        </div>
      )}

      {error && (
        <div className="hd-scores-state hd-scores-state--error">
          <span>{t('تعذّر تحميل النتائج', 'Could not load scores')}</span>
          <button className="hd-btn hd-btn-ghost" onClick={() => load(dayOffset)}>
            {t('إعادة المحاولة', 'Retry')}
          </button>
        </div>
      )}

      {!loading && !error && blocks.length === 0 && (
        <div className="hd-scores-state">
          <span>{t('لا توجد مباريات في هذا اليوم', 'No matches on this day')}</span>
        </div>
      )}

      {!loading && !error && blocks.map(b => (
        <CompetitionBlock key={b.key} league={b.league} matches={b.matches} lang={lang}/>
      ))}
    </div>
  );
}

window.HdScoresView = ScoresView;
