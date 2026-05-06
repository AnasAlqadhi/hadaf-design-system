// -------------------------------------------------------
// Hadaf — YouTube Data API v3 wrapper
// Requires HADAF_CONFIG.YOUTUBE_KEY + HADAF_CONFIG.YOUTUBE_CHANNEL_ID
// Free quota: 10,000 units/day; search costs 100 units each call.
// -------------------------------------------------------

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

function getYTKey()       { return window.HADAF_CONFIG && window.HADAF_CONFIG.YOUTUBE_KEY; }
function getYTChannelId() { return window.HADAF_CONFIG && window.HADAF_CONFIG.YOUTUBE_CHANNEL_ID; }

async function ytFetch(path) {
  const key = getYTKey();
  if (!key) throw new Error('No YouTube API key configured');
  const sep = path.includes('?') ? '&' : '?';
  const url = `${YT_BASE}${path}${sep}key=${encodeURIComponent(key)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`YouTube API ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Fetch latest videos from a YouTube channel (search, sorted by date).
 * Returns [ { videoId, title, thumbnail, publishedAt, channelTitle, url, embedUrl } ]
 */
async function getChannelVideos(channelId, maxResults) {
  const ch  = channelId  || getYTChannelId();
  const max = maxResults || 12;
  if (!ch) throw new Error('No YouTube channel ID configured');
  if (!window.HadafCache) throw new Error('HadafCache not loaded');

  return window.HadafCache.cachedFetch(
    `yt:channel:${ch}:${max}`,
    15 * 60 * 1000, // 15 min TTL
    async () => {
      const data = await ytFetch(
        `/search?part=snippet&channelId=${encodeURIComponent(ch)}&type=video&order=date&maxResults=${max}&regionCode=SA`
      );
      return (data.items || []).map(item => ({
        videoId:      item.id.videoId,
        title:        item.snippet.title,
        thumbnail:    (item.snippet.thumbnails.high || item.snippet.thumbnails.medium || item.snippet.thumbnails.default || {}).url || '',
        publishedAt:  item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        description:  item.snippet.description,
        url:          `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl:     `https://www.youtube.com/embed/${item.id.videoId}`,
      }));
    },
    'youtube'
  );
}

/**
 * Fetch videos from a playlist.
 * Returns same shape as getChannelVideos.
 */
async function getPlaylistVideos(playlistId, maxResults) {
  const max = maxResults || 12;
  if (!window.HadafCache) throw new Error('HadafCache not loaded');

  return window.HadafCache.cachedFetch(
    `yt:playlist:${playlistId}:${max}`,
    15 * 60 * 1000,
    async () => {
      const data = await ytFetch(
        `/playlistItems?part=snippet&playlistId=${encodeURIComponent(playlistId)}&maxResults=${max}`
      );
      return (data.items || [])
        .filter(item => item.snippet.resourceId && item.snippet.resourceId.videoId)
        .map(item => {
          const vid = item.snippet.resourceId.videoId;
          return {
            videoId:      vid,
            title:        item.snippet.title,
            thumbnail:    (item.snippet.thumbnails.high || item.snippet.thumbnails.medium || item.snippet.thumbnails.default || {}).url || '',
            publishedAt:  item.snippet.publishedAt,
            channelTitle: item.snippet.channelTitle,
            description:  item.snippet.description,
            url:          `https://www.youtube.com/watch?v=${vid}`,
            embedUrl:     `https://www.youtube.com/embed/${vid}`,
          };
        });
    },
    'youtube'
  );
}

window.HadafVideoApi = { getChannelVideos, getPlaylistVideos };
