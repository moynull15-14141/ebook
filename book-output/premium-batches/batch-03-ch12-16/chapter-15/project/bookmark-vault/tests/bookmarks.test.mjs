// Bookmark-এর নিয়ম, Import-Export ও Storage Adapter-এর Test (Node.js)।  চালানোর Command:  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BookmarkError, SCHEMA_VERSION, normalizeUrl, parseTags, createBookmark, addBookmark,
  toggleFavorite, removeBookmark, filterBookmarks, allTags, reviveBookmark, parseStored,
  exportData, importData,
} from '../src/bookmarks.mjs';
import { createStore, STORAGE_KEY } from '../src/storage.mjs';

let counter = 0;
const clock = () => ({ now: () => new Date('2026-10-15T09:00:00Z'), makeId: () => `id-${++counter}` });
const make = (title, url, tags = '') => createBookmark({ title, url, tags }, clock());
const isBookmarkError = (message) => (e) => e instanceof BookmarkError && (!message || e.message === message);

test('normalizeUrl: # বাদ, Host ছোট হাতের অক্ষরে, আগে-পরের ফাঁকা জায়গা বাদ', () => {
  assert.equal(normalizeUrl('  https://Developer.Mozilla.org/docs#top '), 'https://developer.mozilla.org/docs');
  assert.equal(normalizeUrl('http://example.com'), 'http://example.com/');
});

test('normalizeUrl: javascript:, data:, ftp: এবং অবৈধ লেখা বাতিল', () => {
  assert.throws(() => normalizeUrl('javascript:alert(1)'), isBookmarkError('"javascript:" ধরনের URL গ্রহণযোগ্য নয়।'));
  assert.throws(() => normalizeUrl('data:text/html,<b>x</b>'), isBookmarkError());
  assert.throws(() => normalizeUrl('ftp://example.com/file'), isBookmarkError());
  for (const bad of ['example.com', '', null, 'https://']) {
    assert.throws(() => normalizeUrl(bad), isBookmarkError('সঠিক একটি URL লিখুন (https://...)।'), String(bad));
  }
});

test('parseTags: কমা বা Array থেকে; ছোট হাতের অক্ষর; পুনরাবৃত্তি ও ফাঁকা বাদ; ক্রম অক্ষত', () => {
  assert.deepEqual(parseTags('JS, Docs, js, , docs'), ['js', 'docs']);
  assert.deepEqual(parseTags([' A ', 'b', 'a']), ['a', 'b']);
  assert.deepEqual(parseTags(undefined), []);
});

test('createBookmark: Inject করা সময় ও ID; শিরোনাম trim; সীমা 100', () => {
  const bookmark = createBookmark({ title: '  MDN ', url: 'https://developer.mozilla.org/#x', tags: 'JS' }, {
    now: () => new Date('2026-01-02T03:04:05Z'), makeId: () => 'fixed',
  });
  assert.deepEqual(bookmark, {
    id: 'fixed', title: 'MDN', url: 'https://developer.mozilla.org/', tags: ['js'], favorite: false, createdAt: '2026-01-02T03:04:05.000Z',
  });
  assert.throws(() => make(' ', 'https://a.com'), isBookmarkError('শিরোনাম 1 থেকে 100 অক্ষরের হতে হবে।'));
  assert.throws(() => make('x'.repeat(101), 'https://a.com'), isBookmarkError());
  assert.doesNotThrow(() => make('x'.repeat(100), 'https://a.com'));
});

test('createBookmark: Default-এ crypto.randomUUID ও বর্তমান সময়', () => {
  const bookmark = createBookmark({ title: 'A', url: 'https://a.com' });
  assert.match(bookmark.id, /^[0-9a-f-]{36}$/);
  assert.ok(Math.abs(Date.parse(bookmark.createdAt) - Date.now()) < 5000);
});

test('addBookmark: নতুনটি ওপরে; একই URL (# বাদে) দুবার নয়; মূল তালিকা অপরিবর্তিত', () => {
  const first = make('A', 'https://a.com');
  const list = addBookmark([], first);
  const next = addBookmark(list, make('B', 'https://b.com'));
  assert.deepEqual(next.map((b) => b.title), ['B', 'A']);
  assert.equal(list.length, 1);
  assert.throws(() => addBookmark(next, make('A2', 'https://a.com/#again')), isBookmarkError('এই URL আগে থেকেই আছে।'));
});

test('toggleFavorite ও removeBookmark: শুধু লক্ষ্যটি বদলায়', () => {
  const a = make('A', 'https://a.com');
  const b = make('B', 'https://b.com');
  const toggled = toggleFavorite([a, b], a.id);
  assert.equal(toggled[0].favorite, true);
  assert.equal(toggled[1], b);
  assert.equal(a.favorite, false);
  assert.deepEqual(removeBookmark(toggled, a.id).map((x) => x.title), ['B']);
});

test('filterBookmarks: খোঁজা (শিরোনাম ও URL), Tag, শুধু প্রিয়, এবং তিনটি একসঙ্গে', () => {
  const list = [
    { ...make('MDN Web Docs', 'https://developer.mozilla.org', 'docs, js'), favorite: true },
    make('Node.js', 'https://nodejs.org', 'docs'),
    make('Game', 'https://example.com/node-game', 'fun'),
  ];
  const titles = (filters) => filterBookmarks(list, filters).map((b) => b.title);
  assert.deepEqual(titles({ query: 'NODE' }), ['Node.js', 'Game']);
  assert.deepEqual(titles({ tag: 'docs' }), ['MDN Web Docs', 'Node.js']);
  assert.deepEqual(titles({ favoritesOnly: true }), ['MDN Web Docs']);
  assert.deepEqual(titles({ query: 'mozilla', tag: 'docs', favoritesOnly: true }), ['MDN Web Docs']);
  assert.deepEqual(titles({}), ['MDN Web Docs', 'Node.js', 'Game']);
});

test('allTags: পুনরাবৃত্তি ছাড়া, বর্ণানুক্রমে', () => {
  assert.deepEqual(allTags([make('A', 'https://a.com', 'js, docs'), make('B', 'https://b.com', 'docs, api')]), ['api', 'docs', 'js']);
});

test('reviveBookmark: বৈধ সংরক্ষিত Bookmark নিজের ID, সময় ও প্রিয়-অবস্থাসহ ফেরে', () => {
  const original = { ...make('A', 'https://a.com', 'x'), favorite: true };
  assert.deepEqual(reviveBookmark(JSON.parse(JSON.stringify(original))), original);
});

test('reviveBookmark: ভুল গঠন বা বিপজ্জনক URL-এ null', () => {
  const ok = make('A', 'https://a.com');
  const bad = [
    null, {}, { ...ok, id: '' }, { ...ok, favorite: 'yes' }, { ...ok, createdAt: 'কাল' },
    { ...ok, url: 'javascript:alert(1)' }, { ...ok, title: '' },
  ];
  for (const raw of bad) {
    assert.equal(reviveBookmark(raw), null, JSON.stringify(raw));
  }
});

test('parseStored: ভাঙা JSON বা Array নয় এমন মানে ফাঁকা; ভুলগুলো বাদ, বৈধগুলো থাকে', () => {
  assert.deepEqual(parseStored('{oops'), []);
  assert.deepEqual(parseStored('{"a":1}'), []);
  assert.deepEqual(parseStored(null), []);
  const good = make('A', 'https://a.com');
  assert.deepEqual(parseStored(JSON.stringify([good, { ...good, id: 'x', url: 'javascript:1' }])), [good]);
});

test('exportData: Version, সময় ও তালিকাসহ পাঠযোগ্য JSON', () => {
  const list = [make('A', 'https://a.com')];
  const data = JSON.parse(exportData(list, new Date('2026-10-15T10:00:00Z')));
  assert.equal(data.version, SCHEMA_VERSION);
  assert.equal(data.exportedAt, '2026-10-15T10:00:00.000Z');
  assert.deepEqual(data.bookmarks, list);
  assert.match(exportData(list), /\n  "version": 1/);
});

test('importData: Round-Trip; পুনরাবৃত্ত (URL বা ID) ও অবৈধগুলো বাদ, সংখ্যা সঠিক', () => {
  const a = make('A', 'https://a.com');
  const b = make('B', 'https://b.com');
  const file = exportData([a, b, { ...b, id: 'other' }, { id: 'evil', url: 'javascript:1' }]);
  const result = importData(file, [a]);
  assert.deepEqual(result.list.map((x) => x.title), ['A', 'B']);
  assert.equal(result.added, 1);
  assert.equal(result.skipped, 3);
});

test('importData: ভাঙা JSON, অচেনা Version বা গঠনে BookmarkError; তালিকা অপরিবর্তিত', () => {
  assert.throws(() => importData('{oops', []), isBookmarkError('File-টি সঠিক JSON নয়।'));
  for (const text of ['{"version":2,"bookmarks":[]}', '{"version":1}', '[]', 'null']) {
    assert.throws(() => importData(text, []), isBookmarkError('অচেনা File-এর গঠন বা Version।'), text);
  }
});

test('createStore: save ও load, নির্দিষ্ট Key; Storage ব্যর্থ হলে নিরাপদ মান', () => {
  const data = new Map();
  const storage = { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
  const store = createStore(storage);
  const list = [make('A', 'https://a.com')];
  assert.equal(store.save(list), true);
  assert.ok(data.has(STORAGE_KEY));
  assert.deepEqual(store.load(), list);

  const broken = createStore({ getItem() { throw new Error('denied'); }, setItem() { throw new Error('QuotaExceededError'); } });
  assert.deepEqual(broken.load(), []);
  assert.equal(broken.save(list), false);
});
