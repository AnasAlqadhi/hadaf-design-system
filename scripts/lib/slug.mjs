// Shared slug helpers — used by both the pipeline (writes slug into feed.json for the
// site to link to) and the page generator (emits article/<slug>.html). Keeping one
// implementation guarantees the URL the site links to is the URL the file is written at.
//
// ASCII-only filenames avoid any git/GitHub-Pages UTF-8 fragility. SEO value comes from
// the page's Arabic <title>/<h1>/JSON-LD, not the slug. A short stable hash guarantees
// uniqueness and survives title edits.

export function shortHash(s) {
  s = String(s || '');
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36).slice(0, 8);
}

export function asciiSlug(s) {
  return (s || '').toLowerCase().normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/g, '');
}

export function makeSlug(a) {
  const cand = asciiSlug(a.title?.en) || asciiSlug(a.title?.ar);
  const h = shortHash(a.id || a.url || JSON.stringify(a.title || ''));
  return (cand ? cand + '-' : 'post-') + h;
}
