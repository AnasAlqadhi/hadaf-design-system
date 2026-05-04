/* global React, HadafAPI, HadafSportmonks */
const { useState, useEffect, useCallback } = React;

// Shared date offset helper (works without HadafAPI)
function offsetDay(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// Convert a Sportmonks block → shape expected by CompetitionBlock
function smBlockToHadaf(b) {
  return {
    key: String(b.leagueId),
    league: { name: b.leagueName, logo: b.leagueLogo },
    matches: b.matches.map(m => ({
      id:        m.id,
      isLive:    m.status === 'live',
      isFinished: m.status === 'ft',
      minute:    m.minute,
      kickoff:   null,           // already formatted in m.time
      kickoffStr: m.time,        // pre-formatted local time
      homeTeam:  { name: m.home.name[lang] || m.home.name.en, logo: m.home.logo },
      awayTeam:  { name: m.away.name[lang] || m.away.name.en, logo: m.away.logo },
      homeScore: m.scoreHome,
      awayScore: m.scoreAway,
      state:     m.state,
    })),
  };
}

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
  const timeDisplay = match.kickoffStr || (match.kickoff ? formatKickoff(match.kickoff) : '--:--');

  return (
    <div className={`hd-sr-row${isLive ? ' is-live' : ''}${isFinished ? ' is-done' : ''}`}>
      {/* Time / Status */}
      <div className="hd-sr-time">
        {isLive
          ? <span className="hd-sr-live-badge">{match.minute ? `${match.minute}'` : t('مباشر','LIVE')}</span>
          : isFinished
            ? <span className="hd-sr-ft">{t('ن.م', 'FT')}</span>
            : <span>{timeDisplay}</span>
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
  const leagueName = typeof league.name === 'object'
    ? (lang === 'ar' ? league.name.ar : league.name.en)
    : league.name;

  return (
    <div className="hd-sr-block">
      <button className="hd-sr-league-header" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        {league.logo && <img src={league.logo} alt="" width="20" height="20" style={{borderRadius:3,objectFit:'contain'}}/>}
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

// Main Scores View — prefers Sportmonks, falls back to API-Football
function ScoresView({ lang }) {
  const t = (ar, en) => lang === 'ar' ? ar : en;
  const [dayOffset, setDayOffset] = useState(0);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('');

  const load = useCallback(async (offset) => {
    setLoading(true);
    setError(null);
    const dateStr = offsetDay(offset);

    // Try Sportmonks first
    const smKey = window.HADAF_CONFIG && window.HADAF_CONFIG.SPORTMONKS_KEY;
    if (smKey && typeof HadafSportmonks !== 'undefined') {
      try {
        const smBlocks = await HadafSportmonks.getSmFixturesByDate(dateStr);
        // Convert to internal shape (lang captured in closure)
        const normalized = smBlocks.map(b => ({
          key: String(b.leagueId),
          league: { name: b.leagueName, logo: b.leagueLogo },
          matches: b.matches.map(m => ({
            id: m.id,
            isLive: m.status === 'live',
            isFinished: m.status === 'ft',
            minute: m.minute,
            kickoffStr: m.time,
            homeTeam: { name: lang === 'ar' ? m.home.name.ar : m.home.name.en, logo: m.home.logo },
            awayTeam: { name: lang === 'ar' ? m.away.name.ar : m.away.name.en, logo: m.away.logo },
            homeScore: m.scoreHome,
            awayScore: m.scoreAway,
          })),
        }));
        setBlocks(normalized);
        setSource('sportmonks');
        return;
      } catch(e) {
        console.warn('Sportmonks failed, falling back to API-Football:', e.message);
      }
    }

    // Fallback: API-Football
    try {
      const data = await HadafAPI.getFixturesByDate(dateStr);
      setBlocks(data);
      setSource('api-football');
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [lang]);

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
