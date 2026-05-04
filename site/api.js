// -------------------------------------------------------
// Hadaf — API-Football wrapper
// Docs: https://www.api-football.com/documentation-v3
// -------------------------------------------------------

const BASE = 'https://v3.football.api-sports.io';

// CORS proxy list — tried in order when direct call fails
const CORS_PROXIES = [
  url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

function getKey() {
  return window.HADAF_CONFIG && window.HADAF_CONFIG.API_FOOTBALL_KEY;
}

// Build request options — API-Football requires the key in headers;
// when going through a proxy the header is forwarded as a query param fallback
async function apiFetch(path) {
  const key = getKey();
  if (!key) throw new Error('No API key — set window.HADAF_CONFIG.API_FOOTBALL_KEY');
  const fullUrl = `${BASE}${path}`;

  // Try direct first (works on localhost / if CORS is allowed)
  const opts = { headers: { 'x-apisports-key': key } };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(fullUrl, { ...opts, signal: ctrl.signal });
    clearTimeout(t);
    if (res.ok) {
      const json = await res.json();
      if (json.errors && Object.keys(json.errors).length) console.warn('API-Football errors:', json.errors);
      return json;
    }
  } catch(e) {
    if (e.name !== 'AbortError') console.warn('Direct API fetch failed, trying proxies...', e.message);
  }

  // Fallback: CORS proxies (free public proxies forward the URL, not headers;
  // so we append the key as a query string — API-Football also accepts ?apisports-key=)
  const proxyUrl = fullUrl + (path.includes('?') ? '&' : '?') + `apisports-key=${key}`;
  for (const makeProxy of CORS_PROXIES) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(makeProxy(proxyUrl), { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) continue;
      const text = await res.text();
      // Proxy may return HTML error page — validate JSON
      if (!text.trim().startsWith('{')) continue;
      const json = JSON.parse(text);
      if (json.errors && Object.keys(json.errors).length) console.warn('API-Football errors:', json.errors);
      return json;
    } catch(e) {
      console.warn('Proxy failed, trying next...', e.message);
    }
  }
  throw new Error('All API fetch attempts failed for: ' + path);
}

// League IDs used by Hadaf
const LEAGUES = {
  saudi:      { id: 307, name: { ar: 'دوري روشن',      en: 'Saudi Pro League' },  season: 2025 },
  ucl:        { id: 2,   name: { ar: 'دوري الأبطال',   en: 'Champions League' },  season: 2025 },
  premier:    { id: 39,  name: { ar: 'البريميرليغ',    en: 'Premier League' },    season: 2025 },
  laliga:     { id: 140, name: { ar: 'الليغا',          en: 'La Liga' },           season: 2025 },
  seriea:     { id: 135, name: { ar: 'السيريا آ',       en: 'Serie A' },           season: 2025 },
  bundesliga: { id: 78,  name: { ar: 'البوندسليغا',    en: 'Bundesliga' },        season: 2025 },
};

// Returns today's date as YYYY-MM-DD
function today() {
  return new Date().toISOString().slice(0, 10);
}
function offsetDay(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ------------------------------------------------------------------
// PUBLIC API
// ------------------------------------------------------------------

/**
 * Get fixtures for a specific date across all Hadaf leagues.
 * Returns array of competition blocks: [{ league, matches }]
 */
async function getFixturesByDate(dateStr) {
  const leagueIds = Object.values(LEAGUES).map(l => l.id);
  const requests = leagueIds.map(id =>
    apiFetch(`/fixtures?league=${id}&date=${dateStr}&timezone=Asia/Riyadh`)
      .then(data => ({ id, fixtures: data.response || [] }))
      .catch(err => { console.error(`League ${id} failed:`, err.message); return { id, fixtures: [] }; })
  );
  const results = await Promise.all(requests);

  // Group into blocks, skip empty leagues
  const blocks = [];
  for (const [key, meta] of Object.entries(LEAGUES)) {
    const found = results.find(r => r.id === meta.id);
    const matches = (found?.fixtures || []).map(normalizeFixture);
    if (matches.length > 0) {
      blocks.push({ key, league: meta, matches });
    }
  }
  return blocks;
}

/**
 * Get live fixtures right now across all Hadaf leagues.
 */
async function getLiveFixtures() {
  const data = await apiFetch('/fixtures?live=all');
  const fixtures = (data.response || []).filter(f =>
    Object.values(LEAGUES).some(l => l.id === f.league.id)
  );
  return fixtures.map(normalizeFixture);
}

/**
 * Get standings for a league.
 */
async function getStandings(leagueKey) {
  const meta = LEAGUES[leagueKey];
  if (!meta) throw new Error(`Unknown league: ${leagueKey}`);
  const data = await apiFetch(`/standings?league=${meta.id}&season=${meta.season}`);
  const raw = data.response?.[0]?.league?.standings?.[0] || [];
  return raw.map(row => ({
    rank: row.rank,
    team: row.team.name,
    teamAr: row.team.name, // API doesn't provide Arabic names — keep English
    logo: row.team.logo,
    p: row.all.played,
    w: row.all.win,
    d: row.all.draw,
    l: row.all.lose,
    gf: row.all.goals.for,
    ga: row.all.goals.against,
    pts: row.points,
  }));
}

// ------------------------------------------------------------------
// NORMALISER — converts API fixture → Hadaf internal shape
// ------------------------------------------------------------------
function normalizeFixture(f) {
  const status = f.fixture.status.short; // NS, 1H, HT, 2H, FT, etc.
  const isLive = ['1H','HT','2H','ET','P','BT'].includes(status);
  const isFinished = ['FT','AET','PEN'].includes(status);
  const minute = f.fixture.status.elapsed;

  return {
    id: f.fixture.id,
    competition: f.league.name,
    competitionId: f.league.id,
    homeTeam: { name: f.teams.home.name, logo: f.teams.home.logo },
    awayTeam: { name: f.teams.away.name, logo: f.teams.away.logo },
    homeScore: f.goals.home,
    awayScore: f.goals.away,
    minute: isLive ? minute : null,
    status,
    isLive,
    isFinished,
    kickoff: f.fixture.date, // ISO string
  };
}

// ------------------------------------------------------------------
// EXPORT
// ------------------------------------------------------------------
window.HadafAPI = {
  LEAGUES,
  today,
  offsetDay,
  getFixturesByDate,
  getLiveFixtures,
  getStandings,
};
