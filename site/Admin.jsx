/* global React, HadafArticleStore */
const { useState: useStateAdm, useEffect: useEffectAdm, useMemo: useMemoAdm } = React;

// -------------------------------------------------------
// Hadaf — Admin / Editor
// Hidden behind a passcode + GitHub PAT.
// Publishes to data/articles.json via the GitHub Contents API,
// which triggers the Pages deploy workflow automatically.
// -------------------------------------------------------

const ADMIN_PASSCODE = 'hadaf2026'; // ← change this string to rotate the passcode
const GH_REPO_OWNER  = 'AnasAlqadhi';
const GH_REPO_NAME   = 'hadaf-design-system';
const GH_BRANCH      = 'main';
const GH_FILE_PATH   = 'data/articles.json';
const PAT_STORAGE_KEY = 'hadaf:github_pat';

// --- base64 helpers that survive Arabic/Unicode ---
function b64Encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function b64Decode(str) {
  return decodeURIComponent(escape(atob(str.replace(/\s/g, ''))));
}

// --- GitHub Contents API ---
async function ghGetFile(pat) {
  const url = `https://api.github.com/repos/${GH_REPO_OWNER}/${GH_REPO_NAME}/contents/${GH_FILE_PATH}?ref=${GH_BRANCH}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${pat}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub GET failed: ${res.status} ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  const decoded = b64Decode(json.content);
  return { sha: json.sha, data: JSON.parse(decoded) };
}

async function ghPutFile(pat, sha, newData, message) {
  const url = `https://api.github.com/repos/${GH_REPO_OWNER}/${GH_REPO_NAME}/contents/${GH_FILE_PATH}`;
  const body = {
    message: message || 'admin: update articles overrides',
    content: b64Encode(JSON.stringify(newData, null, 2) + '\n'),
    sha,
    branch: GH_BRANCH,
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub PUT failed: ${res.status} ${txt.slice(0, 200)}`);
  }
  return res.json();
}

// --- Toast notification (lightweight) ---
function Toast({ message, kind, onDismiss }) {
  useEffectAdm(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [message, onDismiss]);
  if (!message) return null;
  return <div className={`hd-admin-toast hd-admin-toast--${kind}`}>{message}</div>;
}

// --- Passcode gate ---
function Gate({ onUnlock, lang }) {
  const [code, setCode] = useStateAdm('');
  const [err, setErr]   = useStateAdm(false);
  function submit(e) {
    e.preventDefault();
    if (code === ADMIN_PASSCODE) onUnlock();
    else { setErr(true); setCode(''); }
  }
  return (
    <div className="hd-admin-gate">
      <div className="hd-admin-gate-card">
        <h2>{lang === 'ar' ? 'لوحة التحكم' : 'Admin'}</h2>
        <p style={{opacity:0.7,fontSize:13,marginBottom:18}}>
          {lang === 'ar' ? 'أدخل رمز الدخول للمتابعة' : 'Enter passcode to continue'}
        </p>
        <form onSubmit={submit}>
          <input
            type="password"
            autoFocus
            value={code}
            onChange={e => { setCode(e.target.value); setErr(false); }}
            placeholder={lang === 'ar' ? 'رمز الدخول' : 'Passcode'}
            className="hd-admin-input"
          />
          {err && (
            <div style={{color:'var(--live-red,#E03131)',fontSize:12,marginTop:8}}>
              {lang === 'ar' ? 'رمز خاطئ' : 'Wrong passcode'}
            </div>
          )}
          <button type="submit" className="hd-admin-btn hd-admin-btn--primary" style={{marginTop:14,width:'100%'}}>
            {lang === 'ar' ? 'دخول' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Editor: Manage RSS articles tab ---
function ManageRssTab({ feed, overrides, setOverrides, lang }) {
  if (!feed || !feed.length) {
    return (
      <div className="hd-admin-empty">
        {lang === 'ar' ? 'لم يتم تحميل مقالات RSS بعد. عُد إلى الصفحة الرئيسية أولاً ليتم تحميلها.' :
                        'No RSS articles loaded yet. Visit the home page first to load them.'}
      </div>
    );
  }
  const hidden   = new Set(overrides.rules.hidden_urls);
  const featured = new Set(overrides.rules.featured_urls);
  const hero     = new Set(overrides.rules.hero_urls);

  function toggle(setName, url) {
    setOverrides(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const arr = next.rules[setName];
      const idx = arr.indexOf(url);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(url);
      return next;
    });
  }

  return (
    <div className="hd-admin-rss-list">
      <p className="hd-admin-help">
        {lang === 'ar'
          ? 'تحكم بالأخبار المسحوبة من المصادر الخارجية: أخفِها أو ثبّتها أو أضفها لشريط البطل.'
          : 'Control articles pulled from RSS feeds: hide, feature them, or pin to the hero carousel.'}
      </p>
      {feed.filter(a => a.url).map(a => {
        const url = a.url;
        const titleStr = (a.title && (a.title.ar || a.title.en)) || a.title || '';
        const kickerStr = (a.kicker && (a.kicker.ar || a.kicker.en)) || a.kicker || '';
        return (
          <div key={url} className={`hd-admin-rss-row${hidden.has(url) ? ' is-hidden' : ''}`}>
            {a.image && <img src={a.image} alt="" className="hd-admin-rss-thumb"/>}
            <div className="hd-admin-rss-body">
              <div className="hd-admin-rss-kicker">{kickerStr}</div>
              <div className="hd-admin-rss-title">{titleStr}</div>
              <a href={url} target="_blank" rel="noopener noreferrer" className="hd-admin-rss-url">{url}</a>
            </div>
            <div className="hd-admin-rss-actions">
              <label className="hd-admin-checkbox">
                <input type="checkbox" checked={hidden.has(url)}   onChange={() => toggle('hidden_urls', url)}/>
                {lang === 'ar' ? 'إخفاء' : 'Hide'}
              </label>
              <label className="hd-admin-checkbox">
                <input type="checkbox" checked={featured.has(url)} onChange={() => toggle('featured_urls', url)}/>
                {lang === 'ar' ? 'مميّز' : 'Feature'}
              </label>
              <label className="hd-admin-checkbox">
                <input type="checkbox" checked={hero.has(url)}     onChange={() => toggle('hero_urls', url)}/>
                {lang === 'ar' ? 'في الواجهة' : 'Hero'}
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Editor: Custom articles tab ---
function emptyCustom() {
  return {
    id:        'custom-' + Date.now(),
    title:     { ar: '', en: '' },
    kicker:    { ar: 'هدف', en: 'Hadaf' },
    image:     '',
    excerpt:   { ar: '', en: '' },
    body:      { ar: [''], en: [''] },
    pubDate:   new Date().toISOString(),
    publishAt: '',   // ISO string; empty = publish immediately on next deploy
    featured:  false,
    hidden:    false,
  };
}

// Convert an ISO string to the value required by <input type="datetime-local">
function isoToDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
}

function CustomTab({ overrides, setOverrides, lang }) {
  const [editing, setEditing] = useStateAdm(null); // article object being edited

  function startNew() { setEditing(emptyCustom()); }
  function startEdit(c) { setEditing(JSON.parse(JSON.stringify(c))); }
  function saveDraft() {
    setOverrides(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const idx = next.custom.findIndex(c => c.id === editing.id);
      if (idx >= 0) next.custom[idx] = editing;
      else next.custom.unshift(editing);
      return next;
    });
    setEditing(null);
  }
  function del(id) {
    if (!confirm(lang === 'ar' ? 'حذف المقال؟' : 'Delete this article?')) return;
    setOverrides(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.custom = next.custom.filter(c => c.id !== id);
      return next;
    });
  }

  if (editing) {
    return (
      <div className="hd-admin-edit">
        <h3>{lang === 'ar' ? 'تحرير مقال' : 'Edit article'}</h3>

        <label className="hd-admin-field">
          <span>{lang === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</span>
          <input
            value={editing.title.ar}
            onChange={e => setEditing({...editing, title:{...editing.title, ar:e.target.value}})}
            className="hd-admin-input"
            dir="rtl"
          />
        </label>
        <label className="hd-admin-field">
          <span>{lang === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</span>
          <input
            value={editing.title.en}
            onChange={e => setEditing({...editing, title:{...editing.title, en:e.target.value}})}
            className="hd-admin-input"
          />
        </label>

        <div className="hd-admin-row2">
          <label className="hd-admin-field">
            <span>{lang === 'ar' ? 'القسم (عربي)' : 'Kicker (AR)'}</span>
            <input
              value={editing.kicker.ar}
              onChange={e => setEditing({...editing, kicker:{...editing.kicker, ar:e.target.value}})}
              className="hd-admin-input" dir="rtl"
            />
          </label>
          <label className="hd-admin-field">
            <span>{lang === 'ar' ? 'القسم (EN)' : 'Kicker (EN)'}</span>
            <input
              value={editing.kicker.en}
              onChange={e => setEditing({...editing, kicker:{...editing.kicker, en:e.target.value}})}
              className="hd-admin-input"
            />
          </label>
        </div>

        <label className="hd-admin-field">
          <span>{lang === 'ar' ? 'رابط الصورة' : 'Image URL'}</span>
          <input
            value={editing.image}
            onChange={e => setEditing({...editing, image:e.target.value})}
            className="hd-admin-input"
            placeholder="https://… or assets/imagery/match-action-goal.png"
          />
          {editing.image && <img src={editing.image} alt="" style={{maxHeight:120,marginTop:8,borderRadius:8,objectFit:'cover'}}/>}
        </label>

        <label className="hd-admin-field">
          <span>{lang === 'ar' ? 'مقتطف (عربي)' : 'Excerpt (AR)'}</span>
          <textarea
            value={editing.excerpt.ar}
            onChange={e => setEditing({...editing, excerpt:{...editing.excerpt, ar:e.target.value}})}
            className="hd-admin-input" rows={2} dir="rtl"
          />
        </label>
        <label className="hd-admin-field">
          <span>{lang === 'ar' ? 'مقتطف (إنجليزي)' : 'Excerpt (EN)'}</span>
          <textarea
            value={editing.excerpt.en}
            onChange={e => setEditing({...editing, excerpt:{...editing.excerpt, en:e.target.value}})}
            className="hd-admin-input" rows={2}
          />
        </label>

        <label className="hd-admin-field">
          <span>{lang === 'ar' ? 'النص (عربي) — فقرة لكل سطر' : 'Body (AR) — one paragraph per line'}</span>
          <textarea
            value={(editing.body.ar || []).join('\n')}
            onChange={e => setEditing({...editing, body:{...editing.body, ar:e.target.value.split('\n')}})}
            className="hd-admin-input" rows={6} dir="rtl"
          />
        </label>
        <label className="hd-admin-field">
          <span>{lang === 'ar' ? 'النص (إنجليزي)' : 'Body (EN)'}</span>
          <textarea
            value={(editing.body.en || []).join('\n')}
            onChange={e => setEditing({...editing, body:{...editing.body, en:e.target.value.split('\n')}})}
            className="hd-admin-input" rows={6}
          />
        </label>

        <label className="hd-admin-field" style={{marginTop:8}}>
          <span>{lang === 'ar' ? 'جدولة النشر (اختياري)' : 'Schedule publish (optional)'}</span>
          <input
            type="datetime-local"
            value={isoToDatetimeLocal(editing.publishAt)}
            onChange={e => setEditing({...editing, publishAt: e.target.value ? new Date(e.target.value).toISOString() : ''})}
            className="hd-admin-input"
          />
          <small style={{opacity:0.7,marginTop:4,display:'block'}}>
            {lang === 'ar'
              ? 'اتركه فارغاً للنشر الفوري عند التحديث.'
              : 'Leave blank to publish immediately on next deploy.'}
          </small>
        </label>

        <label className="hd-admin-checkbox" style={{marginTop:8}}>
          <input
            type="checkbox"
            checked={!!editing.featured}
            onChange={e => setEditing({...editing, featured:e.target.checked})}
          />
          {lang === 'ar' ? 'مميّز (يظهر أوّلًا)' : 'Featured (pin to top)'}
        </label>

        <div style={{display:'flex',gap:10,marginTop:18}}>
          <button className="hd-admin-btn hd-admin-btn--primary" onClick={saveDraft}>
            {lang === 'ar' ? 'حفظ المسودّة' : 'Save draft'}
          </button>
          <button className="hd-admin-btn" onClick={() => setEditing(null)}>
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
        <p className="hd-admin-help" style={{marginTop:14}}>
          {lang === 'ar'
            ? 'الحفظ هنا يضع المقال في المسوّدات. ستحتاج للضغط على "نشر" في الأعلى لرفع التغييرات إلى الموقع.'
            : 'Saving here only stores the draft locally. You still need to click "Publish" at the top to push changes to the live site.'}
        </p>
      </div>
    );
  }

  const list = overrides.custom || [];

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <h3 style={{margin:0}}>{lang === 'ar' ? 'المقالات المخصّصة' : 'Custom articles'}</h3>
        <button className="hd-admin-btn hd-admin-btn--primary" onClick={startNew}>
          + {lang === 'ar' ? 'مقال جديد' : 'New article'}
        </button>
      </div>
      {list.length === 0 && (
        <div className="hd-admin-empty">
          {lang === 'ar'
            ? 'لا توجد مقالات مخصّصة بعد. اضغط "+ مقال جديد" للبدء.'
            : 'No custom articles yet. Click "+ New article" to start.'}
        </div>
      )}
      {list.map(c => (
        <div key={c.id} className="hd-admin-rss-row">
          {c.image && <img src={c.image} alt="" className="hd-admin-rss-thumb"/>}
          <div className="hd-admin-rss-body">
            <div className="hd-admin-rss-kicker">
              {(c.kicker && (c.kicker.ar || c.kicker.en)) || ''}
              {c.featured && <span style={{marginInlineStart:8,color:'var(--hadaf-gold)',fontWeight:700}}>★</span>}
            </div>
            <div className="hd-admin-rss-title">
              {(c.title && (c.title.ar || c.title.en)) || ''}
            </div>
          </div>
          <div className="hd-admin-rss-actions">
            <button className="hd-admin-btn" onClick={() => startEdit(c)}>
              {lang === 'ar' ? 'تحرير' : 'Edit'}
            </button>
            <button className="hd-admin-btn hd-admin-btn--danger" onClick={() => del(c.id)}>
              {lang === 'ar' ? 'حذف' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Editor: Settings tab ---
function SettingsTab({ pat, setPat, onClearCache, lang }) {
  return (
    <div>
      <h3>{lang === 'ar' ? 'الإعدادات' : 'Settings'}</h3>

      <label className="hd-admin-field">
        <span>{lang === 'ar' ? 'GitHub Personal Access Token' : 'GitHub Personal Access Token'}</span>
        <input
          type="password"
          value={pat}
          onChange={e => setPat(e.target.value)}
          className="hd-admin-input"
          placeholder="ghp_… or github_pat_…"
        />
        <small style={{opacity:0.7,marginTop:6,display:'block'}}>
          {lang === 'ar'
            ? `يُحفظ في متصفّحك فقط. يحتاج صلاحية repo. أنشئه من github.com/settings/tokens`
            : `Stored in your browser only. Needs the "repo" scope. Create one at github.com/settings/tokens`}
        </small>
      </label>

      <hr style={{margin:'24px 0',borderColor:'rgba(0,0,0,0.08)'}}/>

      <h4>{lang === 'ar' ? 'الذاكرة المؤقتة' : 'Cache'}</h4>
      <p className="hd-admin-help">
        {lang === 'ar'
          ? 'يخزن الموقع نتائج API لمدة 5 دقائق. امسحها للحصول على بيانات طازجة.'
          : 'The site caches API responses for ~5 minutes. Clear it to force fresh data.'}
      </p>
      <button className="hd-admin-btn" onClick={onClearCache}>
        {lang === 'ar' ? 'مسح الذاكرة المؤقتة' : 'Clear cache'}
      </button>
    </div>
  );
}

// --- Main Admin component ---
function Admin({ lang, setRoute, feed }) {
  const [unlocked, setUnlocked] = useStateAdm(false);
  const [overrides, setOverrides] = useStateAdm(null);
  const [pat, setPat] = useStateAdm(() => localStorage.getItem(PAT_STORAGE_KEY) || '');
  const [tab, setTab] = useStateAdm('rss');
  const [publishing, setPublishing] = useStateAdm(false);
  const [toast, setToast] = useStateAdm(null);
  const [dirty, setDirty] = useStateAdm(false);

  // Load current overrides on unlock
  useEffectAdm(() => {
    if (!unlocked) return;
    if (window.HadafArticleStore) {
      window.HadafArticleStore.loadOverrides().then(o => {
        setOverrides(JSON.parse(JSON.stringify(o)));
      });
    }
  }, [unlocked]);

  // Persist PAT to localStorage
  useEffectAdm(() => {
    if (pat) localStorage.setItem(PAT_STORAGE_KEY, pat);
    else localStorage.removeItem(PAT_STORAGE_KEY);
  }, [pat]);

  // Wrap setOverrides so dirty flag flips on every edit
  function updateOverrides(updater) {
    setOverrides(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setDirty(true);
      return next;
    });
  }

  async function publish() {
    if (!pat) {
      setToast({ kind: 'error', message: lang === 'ar'
        ? 'أضف GitHub Personal Access Token في الإعدادات أولاً.'
        : 'Add a GitHub Personal Access Token in Settings first.' });
      setTab('settings');
      return;
    }
    setPublishing(true);
    try {
      const { sha } = await ghGetFile(pat);
      const toPublish = {
        ...overrides,
        version: 1,
        updated: new Date().toISOString(),
      };
      await ghPutFile(pat, sha, toPublish, 'admin: update articles overrides');
      // Sync the in-memory store so home page reflects the change immediately
      // (visitors will see it after the deploy lands ~30s later)
      if (window.HadafArticleStore) window.HadafArticleStore.setOverrides(toPublish);
      setDirty(false);
      setToast({ kind: 'success', message: lang === 'ar'
        ? 'تم النشر! سيظهر التحديث على الموقع خلال 30 ثانية.'
        : 'Published! Live site updates in ~30 seconds.' });
    } catch (e) {
      console.error(e);
      setToast({ kind: 'error', message: (lang === 'ar' ? 'فشل النشر: ' : 'Publish failed: ') + e.message });
    } finally {
      setPublishing(false);
    }
  }

  function clearCache() {
    if (window.HadafCache) {
      const n = window.HadafCache.clearAll();
      setToast({ kind: 'success', message: lang === 'ar' ? `تم مسح ${n} مدخلًا.` : `Cleared ${n} cached entries.` });
    }
  }

  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} lang={lang}/>;

  if (!overrides) {
    return <div className="hd-admin-loading">{lang === 'ar' ? 'جارٍ التحميل…' : 'Loading…'}</div>;
  }

  const tabs = [
    ['rss',      lang === 'ar' ? 'إدارة الأخبار' : 'Manage news'],
    ['custom',   lang === 'ar' ? 'مقالاتي'        : 'Custom articles'],
    ['settings', lang === 'ar' ? 'الإعدادات'      : 'Settings'],
  ];

  return (
    <div className="hd-admin">
      <div className="hd-admin-header">
        <div>
          <h1>{lang === 'ar' ? 'لوحة التحكم' : 'Admin'}</h1>
          <p>{lang === 'ar'
            ? `${overrides.custom.length} مقالًا مخصّصًا · ${overrides.rules.hidden_urls.length} مخفي · ${overrides.rules.featured_urls.length} مميّز`
            : `${overrides.custom.length} custom · ${overrides.rules.hidden_urls.length} hidden · ${overrides.rules.featured_urls.length} featured`}</p>
        </div>
        <div className="hd-admin-header-actions">
          {dirty && (
            <span className="hd-admin-dirty">
              {lang === 'ar' ? 'تغييرات غير منشورة' : 'Unpublished changes'}
            </span>
          )}
          <button
            className="hd-admin-btn hd-admin-btn--primary"
            onClick={publish}
            disabled={publishing}
          >
            {publishing
              ? (lang === 'ar' ? '...جارٍ النشر' : 'Publishing…')
              : (lang === 'ar' ? 'نشر' : 'Publish')}
          </button>
          <button className="hd-admin-btn" onClick={() => { window.location.hash=''; setRoute('home'); }}>
            {lang === 'ar' ? 'الخروج' : 'Exit'}
          </button>
        </div>
      </div>

      <div className="hd-admin-tabs">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            className={`hd-admin-tab${tab === k ? ' is-active' : ''}`}
            onClick={() => setTab(k)}
          >{label}</button>
        ))}
      </div>

      <div className="hd-admin-pane">
        {tab === 'rss'      && <ManageRssTab feed={feed} overrides={overrides} setOverrides={updateOverrides} lang={lang}/>}
        {tab === 'custom'   && <CustomTab           overrides={overrides} setOverrides={updateOverrides} lang={lang}/>}
        {tab === 'settings' && <SettingsTab pat={pat} setPat={setPat} onClearCache={clearCache} lang={lang}/>}
      </div>

      <Toast message={toast?.message} kind={toast?.kind} onDismiss={() => setToast(null)}/>
    </div>
  );
}

window.HdAdmin = Admin;
