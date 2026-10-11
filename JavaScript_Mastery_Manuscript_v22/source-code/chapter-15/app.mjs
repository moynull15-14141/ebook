import {STORAGE_KEY, createBookmark, filterBookmarks, safeParseBookmarks, toExportJSON, parseImportJSON} from './bookmarks.mjs';
const $ = id => document.getElementById(id);
let items = safeParseBookmarks(localStorage.getItem(STORAGE_KEY));
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); $('status').textContent = 'সংরক্ষিত'; }
  catch { $('status').textContent = 'Storage পূর্ণ/বন্ধ: পরিবর্তন সংরক্ষিত হয়নি'; }
}
function render() {
  const visible = filterBookmarks(items, $('search').value, $('tagFilter').value);
  const list = $('list'); list.replaceChildren();
  $('count').textContent = `${visible.length} / ${items.length} Bookmarks`;
  for (const item of visible) {
    const li = document.createElement('li');
    const a = document.createElement('a'); a.textContent = item.title; a.href = item.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    const meta = document.createElement('small'); meta.textContent = `${item.url} · ${item.tags.join(', ') || 'untagged'}`;
    const fav = document.createElement('button'); fav.type = 'button'; fav.textContent = item.favorite ? '★ Unfavorite' : '☆ Favorite'; fav.addEventListener('click', () => { item.favorite = !item.favorite; save(); render(); });
    const del = document.createElement('button'); del.type = 'button'; del.textContent = 'Delete'; del.addEventListener('click', () => { items = items.filter(x => x.id !== item.id); save(); render(); });
    li.append(a, meta, fav, del); list.append(li);
  }
}
$('form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    const item = createBookmark({title: $('title').value, url: $('url').value, tags: $('tags').value});
    if (items.some(x => x.url === item.url)) throw new Error('এই URL আগে থেকেই সংরক্ষিত');
    items.unshift(item); save(); render(); $('form').reset(); $('status').textContent = 'Bookmark যোগ হয়েছে';
  } catch (error) { $('status').textContent = error.message; }
});
$('search').addEventListener('input', render); $('tagFilter').addEventListener('input', render);
$('export').addEventListener('click', () => {
  const blob = new Blob([toExportJSON(items)], {type: 'application/json'});
  const href = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = href; a.download = 'bookmarks.json'; a.click(); URL.revokeObjectURL(href);
});
$('import').addEventListener('change', async event => {
  const file = event.target.files?.[0]; if (!file) return;
  if (file.size > 1024 * 1024) { $('status').textContent = 'File 1MB-এর বেশি'; return; }
  try {
    const incoming = parseImportJSON(await file.text());
    const urls = new Set(items.map(x => x.url));
    const unique = incoming.filter(x => !urls.has(x.url) && urls.add(x.url));
    items = [...unique, ...items]; save(); render(); $('status').textContent = `${unique.length}টি নতুন Bookmark Import হয়েছে`;
  } catch (error) { $('status').textContent = `Import ব্যর্থ: ${error.message}`; }
  event.target.value = '';
});
render();
