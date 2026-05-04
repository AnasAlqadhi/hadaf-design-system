// -------------------------------------------------------
// Hadaf — Sportmonks v3 API wrapper
// Docs: https://docs.sportmonks.com/football
// -------------------------------------------------------

const SM_BASE = 'https://api.sportmonks.com/v3/football';

function getSMKey() {
  return window.HADAF_CONFIG && window.HADAF_CONFIG.SPORTMONKS_KEY;
}

// Known league metadata (name translations + priority order)
// Sportmonks will return whatever leagues are in your subscription;
// this map enriches them with Arabic names and sort order.
const SM_LEAGUE_META = {
  8:    { ar: 'البريميرليغ',       en: 'Premier League',          order: 2 },
  82:   { ar: 'البوندسليغا',       en: 'Bundesliga',              order: 5 },
  301:  { ar: 'الدوري الفرنسي',    en: 'Ligue 1',                 order: 6 },
  384:  { ar: 'السيريا آ',          en: 'Serie A',                 order: 4 },
  564:  { ar: 'الليغا',             en: 'La Liga',                 order: 3 },
  1085: { ar: 'دوري أبطال آسيا',   en: 'AFC Champions League',    order: 7 },
  1452: { ar: 'دوري روشن',          en: 'Saudi Pro League',        order: 1 },
  2:    { ar: 'دوري أبطال أوروبا', en: 'Champions League',        order: 0 },
  3225: { ar: 'الدوري السعودي الاحتياطي', en: 'Saudi Reserve League', order: 9 },
};

async function smFetch(path) {
  const key = getSMKey();
  if (!key) throw new Error('No Sportmonks key — set window.HADAF_CONFIG.SPORTMONKS_KEY');
  const url = `${SM_BASE}${path}`;
  const res = await fetch(url, {
    headers: { Authorization: key }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Sportmonks ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// Normalize a Sportmonks fixture → Hadaf internal shape
function normalizeSmFixture(f) {
  const home = (f.participants || []).find(p => p.meta?.location === 'home') || {};
  const away = (f.participants || []).find(p => p.meta?.location === 'away') || {};

  // Current score: description === 'CURRENT'
  const currentScores = (f.scores || []).filter(s => s.description === 'CURRENT');
  const homeScore = currentScores.find(s => s.score?.participant === 'home')?.score?.goals ?? null;
  const awayScore = currentScores.find(s => s.score?.participant === 'away')?.score?.goals ?? null;

  const state = f.state?.short_name || 'NS';
  const devName = f.state?.developer_name || '';
  const isLive = ['1H','HT','2H','ET','PEN','LIVE'].includes(state) || devName === 'INPLAY';
  const isFT   = ['FT','AET','PEN_FT'].includes(state);

  const leagueId = f.league_id || f.league?.id;
  const leagueMeta = SM_LEAGUE_META[leagueId] || {};
  const leagueName = { ar: leagueMeta.ar || f.league?.name || '', en: leagueMeta.en || f.league?.name || '' };

  // Match time in local time (API returns UTC)
  const startUtc = f.starting_at ? new Date(f.starting_at + ' UTC') : null;
  const timeStr = startUtc
    ? startUtc.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Riyadh' })
    : '--:--';

  return {
    id: f.id,
    leagueId,
    leagueName,
    leagueLogo: f.league?.image_path || '',
    home: {
      id:   home.id,
      name: { ar: home.name || '', en: home.name || '' },
      logo: home.image_path || '',
      code: home.short_code || '',
    },
    away: {
      id:   away.id,
      name: { ar: away.name || '', en: away.name || '' },
      logo: away.image_path || '',
      code: away.short_code || '',
    },
    scoreHome: homeScore,
    scoreAway: awayScore,
    status: isLive ? 'live' : (isFT ? 'ft' : 'scheduled'),
    state,
    minute: null,   // Sportmonks free tier doesn't include live minutes
    time: timeStr,
    startTs: startUtc ? startUtc.getTime() : 0,
  };
}

/**
 * Get fixtures for a given date (YYYY-MM-DD) grouped by league.
 * Returns [ { leagueId, leagueName, leagueLogo, order, matches: [...] } ]
 */
async function getSmFixturesByDate(dateStr) {
  const data = await smFetch(
    `/fixtures/date/${dateStr}?include=participants;scores;league;state&per_page=100`
  );
  const fixtures = (data.data || []).map(normalizeSmFixture);

  // Group by league
  const byLeague = {};
  for (const f of fixtures) {
    if (!byLeague[f.leagueId]) {
      const meta = SM_LEAGUE_META[f.leagueId] || {};
      byLeague[f.leagueId] = {
        leagueId: f.leagueId,
        leagueName: f.leagueName,
        leagueLogo: f.leagueLogo,
        order: meta.order ?? 99,
        matches: [],
      };
    }
    byLeague[f.leagueId].matches.push(f);
  }

  // Sort leagues by priority order, then matches by kick-off time
  const blocks = Object.values(byLeague)
    .sort((a, b) => a.order - b.order);
  for (const b of blocks) {
    b.matches.sort((a, c) => a.startTs - c.startTs);
  }
  return blocks;
}

/**
 * Get live fixtures right now.
 */
async function getSmLiveFixtures() {
  const data = await smFetch(
    `/fixtures/live?include=participants;scores;league;state&per_page=100`
  );
  return (data.data || []).map(normalizeSmFixture);
}

window.HadafSportmonks = { getSmFixturesByDate, getSmLiveFixtures, SM_LEAGUE_META };
