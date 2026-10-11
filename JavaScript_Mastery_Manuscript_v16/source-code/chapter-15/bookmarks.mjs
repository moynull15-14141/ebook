export const STORAGE_KEY = 'jsmastery.bookmarks.v1';
export function normalizeUrl(input) {
  if (typeof input !== 'string' || !input.trim()) throw new Error('URL লিখুন');
  let url;
  try { url = new URL(input.trim()); } catch { throw new Error('সঠিক URL লিখুন (https://...)'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('শুধু http/https URL গ্রহণযোগ্য');
  if (!url.hostname) throw new Error('URL-এ hostname প্রয়োজন');
  url.hash = '';
  return url.href;
}
export function validateBookmark({title, url, tags = ''}) {
  const cleanTitle = String(title ?? '').trim();
  if (cleanTitle.length < 2 || cleanTitle.length > 100) throw new Error('শিরোনাম ২–১০০ অক্ষরের হতে হবে');
  const cleanUrl = normalizeUrl(url);
  const cleanTags = [...new Set(String(tags).split(',').map(t => t.trim().toLowerCase()).filter(Boolean))].slice(0, 10);
  if (cleanTags.some(t => t.length > 25)) throw new Error('প্রতিটি ট্যাগ সর্বোচ্চ ২৫ অক্ষরের');
  return {title: cleanTitle, url: cleanUrl, tags: cleanTags};
}
export function createBookmark(input, id = globalThis.crypto?.randomUUID?.() ?? String(Date.now())) {
  return {...validateBookmark(input), id, createdAt: new Date().toISOString(), favorite: false};
}
export function filterBookmarks(items, query = '', tag = '') {
  const q = String(query).trim().toLocaleLowerCase();
  const t = String(tag).trim().toLocaleLowerCase();
  return items.filter(item => (!t || item.tags.includes(t)) && (!q || [item.title,item.url,...item.tags].join(' ').toLocaleLowerCase().includes(q)));
}
export function safeParseBookmarks(raw) {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(x => x && typeof x.id === 'string' && typeof x.title === 'string' && typeof x.url === 'string' && Array.isArray(x.tags) && typeof x.favorite === 'boolean' && /^https?:\/\//.test(x.url));
  } catch { return []; }
}
export function toExportJSON(items) { return JSON.stringify({version: 1, exportedAt: new Date().toISOString(), bookmarks: items}, null, 2); }
export function parseImportJSON(text) {
  const obj = JSON.parse(text);
  if (obj?.version !== 1 || !Array.isArray(obj.bookmarks)) throw new Error('অসমর্থিত Import Format');
  if (obj.bookmarks.length > 1000) throw new Error('সর্বোচ্চ ১০০০ Bookmark Import করা যাবে');
  const seen = new Set();
  return obj.bookmarks.map(item => {
    const clean = validateBookmark(item);
    const id = typeof item.id === 'string' && item.id.length < 100 ? item.id : crypto.randomUUID();
    if (seen.has(id)) throw new Error('Duplicate ID পাওয়া গেছে');
    seen.add(id);
    return {...clean, id, favorite: item.favorite === true, createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString()};
  });
}
