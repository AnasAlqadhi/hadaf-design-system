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

// CORS proxies — Sportmonks does not send Access-Control-Allow-Origin,
// so direct browser requests are blocked. Route through a proxy chain.
const SM_PROXIES = [
  url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  url => `https://thingproxy.freeboard.io/fetch/${url}`,
];

async function smFetch(path) {
  const key = getSMKey();
  if (!key) throw new Error('No Sportmonks key');
  // api_token in query string works through proxies (no custom headers needed)
  const sep = path.includes('?') ? '&' : '?';
  const directUrl = `${SM_BASE}${path}${sep}api_token=${key}`;

  // Try direct first (works in Node / server environments), then proxies
  const attempts = [
    () => fetch(directUrl, { signal: AbortSignal.timeout(8000) }),
    ...SM_PROXIES.map(p => () => fetch(p(directUrl), { signal: AbortSignal.timeout(10000) })),
  ];

  let lastErr;
  for (const attempt of attempts) {
    try {
      const res = await attempt();
      if (!res.ok) { lastErr = new Error(`Sportmonks ${res.status}`); continue; }
      const json = await res.json();
      if (json.data !== undefined) return json;   // success
      lastErr = new Error(json.message || 'Bad response');
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

// Normalize a Sportmonks fixture → Hadaf internal shape
// If the fixture was fetched with include=round, f.round.name is populated.
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
    startTs:   startUtc ? startUtc.getTime() : 0,
    roundName: f.round?.name || null,
  };
}

/**
 * Get fixtures for a given date (YYYY-MM-DD) grouped by league.
 * Returns [ { leagueId, leagueName, leagueLogo, order, matches: [...] } ]
 */
async function getSmFixturesByDate(dateStr) {
  return window.HadafCache.cachedFetch(
    `sm:fixtures:${dateStr}`,
    5 * 60 * 1000, // 5 min
    async () => {
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

      const blocks = Object.values(byLeague).sort((a, b) => a.order - b.order);
      for (const b of blocks) b.matches.sort((a, c) => a.startTs - c.startTs);
      return blocks;
    },
    'sportmonks'
  );
}

/**
 * Get live fixtures right now (60s cache — live data should stay fresh).
 */
async function getSmLiveFixtures() {
  return window.HadafCache.cachedFetch(
    'sm:fixtures:live',
    60 * 1000, // 1 min
    async () => {
      const data = await smFetch(
        `/fixtures/live?include=participants;scores;league;state&per_page=100`
      );
      return (data.data || []).map(normalizeSmFixture);
    },
    'sportmonks'
  );
}

/**
 * Get fixtures for a league between two dates, grouped by round name.
 * Great for knockout brackets (UCL, etc.).
 * Returns { [roundName]: fixture[] } sorted by start time within each round.
 * @param {number} leagueId  - Sportmonks league ID (e.g. 2 for UCL)
 * @param {string} fromDate  - YYYY-MM-DD
 * @param {string} toDate    - YYYY-MM-DD
 */
async function getSmLeagueFixtures(leagueId, fromDate, toDate) {
  return window.HadafCache.cachedFetch(
    `sm:league:${leagueId}:${fromDate}:${toDate}`,
    30 * 60 * 1000, // 30 min — knockout fixtures don't change often
    async () => {
      const data = await smFetch(
        `/fixtures/between/${fromDate}/${toDate}?filters[league_id]=${leagueId}&include=participants;scores;league;state;round&per_page=150`
      );
      const fixtures = (data.data || []).map(normalizeSmFixture);

      const byRound = {};
      for (const f of fixtures) {
        const key = f.roundName || 'Unknown';
        if (!byRound[key]) byRound[key] = [];
        byRound[key].push(f);
      }
      for (const key of Object.keys(byRound)) {
        byRound[key].sort((a, b) => a.startTs - b.startTs);
      }
      return byRound;
    },
    'sportmonks'
  );
}

window.HadafSportmonks = { getSmFixturesByDate, getSmLiveFixtures, getSmLeagueFixtures, SM_LEAGUE_META };
