// Bookmark Vault-এর Browser Test: Local Server চালিয়ে আসল (Headless) Chrome বা Edge-এ প্রতিটি Browser API যাচাই:
// localStorage, sessionStorage, storage Event (একটি iframe দ্বিতীয় Tab-এর কাজ করে), History/URL, Blob Export, File Import।
// চালানোর Command (Project Folder থেকে):  node tests/browser-check.mjs
// প্রয়োজন: Node.js 22+ এবং Chrome বা Edge (অন্য জায়গায় থাকলে CHROME_PATH)।
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openBrowser } from './cdp.mjs';
import { startStaticServer } from './static-server.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = await startStaticServer(root);
const page = await openBrowser();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vault-'));
const results = [];
const problems = [];

const view = (doc = 'document') => page.eval(`(() => {
  const d = ${doc};
  return {
    titles: [...d.querySelectorAll('#bookmarks a')].map((a) => a.textContent),
    hrefs: [...d.querySelectorAll('#bookmarks a')].map((a) => a.getAttribute('href')),
    tags: [...d.querySelectorAll('#bookmarks .tags')].map((t) => t.textContent),
    pressed: [...d.querySelectorAll('[data-action=favorite]')].map((b) => b.getAttribute('aria-pressed')),
    count: d.querySelector('#count').textContent,
    status: d.querySelector('#status').textContent,
    search: d.defaultView.location.search,
  };
})()`);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function check(name, ok, detail) { results.push({ name, ok, detail: JSON.stringify(detail) }); }
const collect = () => { problems.push(...page.errors); page.errors.length = 0; };
const open = async (query = '') => { collect(); await page.open(`${server.url}/index.html${query}`); await page.sleep(200); };

async function fill(name, text) {
  await page.eval(`document.querySelector('[name="${name}"]').value = ''`);
  if (text) await page.type(`[name="${name}"]`, text);
}
async function add(title, url, tags = '') {
  await fill('title', title);
  await fill('url', url);
  await fill('tags', tags);
  await page.click('#bookmark-form button');
  await page.sleep(80);
}
async function chooseFile(name, content) {
  const file = path.join(tmp, name);
  fs.writeFileSync(file, content);
  const { root: doc } = await page.send('DOM.getDocument');
  const { nodeId } = await page.send('DOM.querySelector', { nodeId: doc.nodeId, selector: '#import' });
  await page.send('DOM.setFileInputFiles', { nodeId, files: [file] });
  await page.sleep(250);
}

try {
  await open();
  let v = await view();
  check('শুরু: ফাঁকা তালিকা, Module লোড হয়েছে', v.titles.length === 0 && v.count === '0টির মধ্যে 0টি দেখানো হচ্ছে', v);

  await add('MDN', 'https://Developer.Mozilla.org/#top', 'JS, Docs, js');
  v = await view();
  check('যোগ: # বাদ, Host ছোট হাতের, Tag পরিষ্কার, বার্তা',
    same(v.hrefs, ['https://developer.mozilla.org/']) && same(v.tags, ['js, docs']) && v.status === 'যোগ হয়েছে: MDN', v);

  await add('Bad', 'javascript:alert(1)');
  v = await view();
  check('javascript: URL বাতিল, তালিকা অপরিবর্তিত', v.status === '"javascript:" ধরনের URL গ্রহণযোগ্য নয়।' && v.titles.length === 1, v);

  await add('Again', 'https://developer.mozilla.org/#other');
  v = await view();
  check('একই URL দুবার নয়', v.status === 'এই URL আগে থেকেই আছে।' && v.titles.length === 1, v);

  await add('Node.js', 'https://nodejs.org/', 'docs');
  await add('Game', 'https://example.com/node-game', 'fun');
  await page.click('#bookmarks li:last-child [data-action=favorite]');
  await page.sleep(60);
  await page.type('#search', 'node');
  await page.sleep(60);
  await page.eval(`(() => { const s = document.querySelector('#tag'); s.value = 'docs'; s.dispatchEvent(new Event('change')); })()`);
  await page.sleep(60);
  v = await view();
  check('খোঁজা ও Tag ছাঁকনি URL-এ প্রতিফলিত', same(v.titles, ['Node.js']) && v.search === '?q=node&tag=docs', v);

  const linkSafe = await page.eval(`[...document.querySelectorAll('#bookmarks a')].every((a) => a.rel === 'noopener noreferrer' && a.target === '_blank')`);
  await open('?tag=docs&fav=1');
  v = await view();
  const favoriteBox = await page.eval(`document.querySelector('#favorites-only').checked`);
  check('Reload ও শেয়ার করা Link: URL থেকে ছাঁকনি ফিরে আসে; বাইরের Link-এ noopener',
    same(v.titles, ['MDN']) && favoriteBox && v.count === '3টির মধ্যে 1টি দেখানো হচ্ছে' && linkSafe, { v, favoriteBox, linkSafe });

  await open();
  await fill('title', 'অর্ধেক');
  await fill('url', 'https://half');
  await open();
  const draft = await page.eval(`[document.querySelector('[name=title]').value, document.querySelector('[name=url]').value]`);
  await fill('url', 'https://half.example.com');
  await page.click('#bookmark-form button');
  await page.sleep(80);
  const draftAfter = await page.eval(`sessionStorage.getItem('jsm-ch15-draft')`);
  check('sessionStorage খসড়া: Reload-এ ফিরে আসে, যোগ করার পর মুছে যায়', same(draft, ['অর্ধেক', 'https://half']) && draftAfter === null, { draft, draftAfter });

  await page.eval(`window.__downloads = []; HTMLAnchorElement.prototype.click = function () { window.__downloads.push({ href: this.href, name: this.download }); };`);
  await page.click('#export');
  await page.sleep(60);
  const exported = await page.eval(`(async () => { const d = window.__downloads[0]; const text = await (await fetch(d.href)).text(); return { name: d.name, blob: d.href.startsWith('blob:'), data: JSON.parse(text) }; })()`);
  v = await view();
  check('Export: blob: ঠিকানা, bookmarks.json, Version 1 ও চারটি Bookmark',
    exported.blob && exported.name === 'bookmarks.json' && exported.data.version === 1 && exported.data.bookmarks.length === 4 && v.status === '4টি Bookmark Export হয়েছে।',
    { exported: { ...exported, data: exported.data.bookmarks.length }, status: v.status });

  const importFile = JSON.stringify({
    version: 1,
    exportedAt: '2026-10-15T00:00:00.000Z',
    bookmarks: [
      exported.data.bookmarks[0],
      { id: 'new-1', title: 'web.dev', url: 'https://web.dev/', tags: ['docs'], favorite: false, createdAt: '2026-10-01T00:00:00.000Z' },
      { id: 'evil', title: 'x', url: 'javascript:alert(1)', tags: [], favorite: false, createdAt: '2026-10-01T00:00:00.000Z' },
    ],
  });
  await chooseFile('import.json', importFile);
  v = await view();
  check('Import (আসল File বাছাই): 1টি যোগ, 2টি বাদ (পুনরাবৃত্ত ও javascript:)', v.status === 'Import: 1টি যোগ, 2টি বাদ।' && v.titles.includes('web.dev') && v.titles.length === 5, v);

  await chooseFile('broken.json', '{ this is not json');
  v = await view();
  check('ভাঙা JSON Import: বার্তা, তালিকা অপরিবর্তিত', v.status === 'File-টি সঠিক JSON নয়।' && v.titles.length === 5, v);

  await page.eval(`new Promise((resolve) => { const f = document.createElement('iframe'); f.id = 'second'; f.src = '/index.html'; f.onload = resolve; document.body.append(f); })`);
  await page.sleep(300);
  await add('Second Tab Test', 'https://example.org/');
  await page.sleep(200);
  const other = await view(`document.querySelector('#second').contentDocument`);
  check('storage Event: দ্বিতীয় "Tab" (iframe) নতুন Bookmark দেখে ও জানায়',
    other.titles.includes('Second Tab Test') && other.status === 'অন্য Tab-এ তালিকা বদলেছে।', other);

  await page.click('#bookmarks li:first-child [data-action=remove]');
  await page.sleep(80);
  v = await view();
  check('মোছা: প্রথম সারি সরে যায়', !v.titles.includes('Second Tab Test') && v.status === 'মুছে ফেলা হয়েছে।', v);

  await page.eval(`localStorage.setItem('jsm-ch15-bookmarks', JSON.stringify([{ id: 'x', title: 'Evil', url: 'javascript:alert(1)', tags: [], favorite: false, createdAt: '2026-10-15T00:00:00Z' }]))`);
  await open();
  v = await view();
  check('Storage-এ হাতে বসানো javascript: Bookmark দেখানো হয় না', v.titles.length === 0, v);

  collect();
  check('পুরো পরীক্ষায় কোনো ধরা না পড়া Exception বা console.error নেই', problems.length === 0, problems);
} finally {
  await page.close();
  await server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(`Browser: ${page.version}`);
results.forEach((r, i) => console.log(`${r.ok ? 'ok' : 'not ok'} ${i + 1} - ${r.name}${r.ok ? '' : `\n  # ${r.detail}`}`));
const failed = results.filter((r) => !r.ok).length;
console.log(`# tests ${results.length}\n# pass ${results.length - failed}\n# fail ${failed}`);
process.exit(failed ? 1 : 0);
