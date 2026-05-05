// -------------------------------------------------------
// Hadaf — localStorage cache + data-status tracker
// Lightweight wrapper used by every API module so we can:
//   1. Avoid hammering APIs on every page load (TTL cache)
//   2. Surface data freshness in the UI ("Live · 30s ago")
//   3. Fall back gracefully when an API is unreachable
// -------------------------------------------------------

const CACHE_PREFIX = 'hadaf:cache:v1:';

// --- localStorage helpers (defensive: storage can be disabled / full) ---
function readCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed; // { data, ts }
  } catch { return null; }
}
function writeCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* quota exceeded or disabled — silently skip */ }
}

/**
 * Cache-then-fetch wrapper.
 * Behaviour:
 *   - If a fresh cache hit (< ttlMs) exists, return it (no network).
 *   - Otherwise call asyncFn(); on success, cache it and return.
 *   - On failure, fall back to a stale cache entry if any; otherwise rethrow.
 *
 * @param {string} key       cache key (unique per logical query)
 * @param {number} ttlMs     freshness window in ms
 * @param {()=>Promise} asyncFn  the actual network call
 * @param {string} source    label used by the status tracker (e.g. 'sportmonks')
 * @returns the resolved data
 */
async function cachedFetch(key, ttlMs, asyncFn, source = key) {
  const cached = readCache(key);
  const age = cached ? Date.now() - cached.ts : Infinity;

  if (cached && age < ttlMs) {
    setStatus(source, 'cached', age);
    return cached.data;
  }

  try {
    const data = await asyncFn();
    writeCache(key, data);
    setStatus(source, 'live', 0);
    return data;
  } catch (err) {
    if (cached) {
      // Stale fallback — better than nothing
      setStatus(source, 'stale', age);
      console.warn(`[hadaf:cache] ${source} fetch failed, serving stale (${Math.round(age/1000)}s old):`, err.message);
      return cached.data;
    }
    setStatus(source, 'down', 0, err.message);
    throw err;
  }
}

// --- Status tracker ---
// State machine:
//   'live'   — just fetched fresh from upstream
//   'cached' — served from a fresh cache entry
//   'stale'  — upstream failed, served older cache
//   'down'   — no cache and upstream failed (mock/empty UI shown)
//   'idle'   — never queried this session
const _status = {};
const _subscribers = new Set();

function setStatus(source, state, age = 0, errorMsg = null) {
  _status[source] = { state, age, ts: Date.now(), errorMsg };
  for (const cb of _subscribers) {
    try { cb(getAllStatuses()); } catch (e) { console.warn('status sub error', e); }
  }
}
function getStatus(source) { return _status[source] || { state: 'idle', age: 0, ts: 0 }; }
function getAllStatuses() { return { ..._status }; }
function subscribe(cb) {
  _subscribers.add(cb);
  return () => _subscribers.delete(cb);
}

// --- Worst-case state across all tracked sources, for a single overall chip ---
const STATE_RANK = { down: 0, stale: 1, cached: 2, live: 3, idle: 4 };
function worstStatus() {
  const entries = Object.entries(_status);
  if (!entries.length) return { source: null, state: 'idle', age: 0 };
  entries.sort((a, b) => STATE_RANK[a[1].state] - STATE_RANK[b[1].state]);
  const [source, info] = entries[0];
  return { source, ...info };
}

// --- Manual cache clear (used by admin tools / dev console) ---
function clearAll() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    return keys.length;
  } catch { return 0; }
}

window.HadafCache = {
  cachedFetch,
  setStatus,
  getStatus,
  getAllStatuses,
  worstStatus,
  subscribe,
  clearAll,
};
