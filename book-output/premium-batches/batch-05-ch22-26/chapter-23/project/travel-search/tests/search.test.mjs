// Optimization-এর প্রথম শর্ত: দ্রুত সংস্করণের ফল ধীর সংস্করণের হুবহু সমান।
// কোনো Test সময় মাপে না।
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRecords, createRandom } from '../src/data.mjs';
import { buildIndex, naiveSearch, indexedSearch } from '../src/search.mjs';

const records = generateRecords();
const index = buildIndex(records);
const ids = (list) => list.map((r) => r.id);

test('তথ্য Seed থেকে নির্ধারিত: দুবার তৈরি করলে একই', () => {
  assert.deepEqual(generateRecords(50), generateRecords(50));
  assert.equal(records.length, 12_000);
  assert.notDeepEqual(generateRecords(50, 1), generateRecords(50, 2));
});

test('নির্দিষ্ট প্রশ্নে দুই খোঁজ একই ফল দেয়', () => {
  const queries = ['sylhet', 'tea resort', 'go', '', 'SYLHET  Tea', 'xyz',
    'saint martin', 'b', 'r h'];
  for (const q of queries) {
    for (const sort of ['relevance', 'price', 'rating']) {
      const options = { sort, maxPrice: 20_000 };
      assert.deepEqual(ids(indexedSearch(index, q, options)),
        ids(naiveSearch(records, q, options)), `${q} / ${sort}`);
    }
  }
});

test('Property: ৩০০টি এলোমেলো প্রশ্নে দুই খোঁজ সমান', () => {
  const random = createRandom(99);
  const vocabulary = ['sy', 'tea', 'hill', 'resort', 'dha', 'g', 'cruise',
    'bang', 'lake', 'home', 'k', 'river', 'royal'];
  for (let i = 0; i < 300; i += 1) {
    const size = 1 + Math.floor(random() * 3);
    const q = Array.from({ length: size },
      () => vocabulary[Math.floor(random() * vocabulary.length)]).join(' ');
    const fast = ids(indexedSearch(index, q));
    assert.deepEqual(fast, ids(naiveSearch(records, q)), q);
  }
});

test('সাজানো: দাম বাড়ার ক্রমে, সমান দামে id-র ক্রমে', () => {
  const list = indexedSearch(index, 'tea', { sort: 'price' });
  for (let i = 1; i < list.length; i += 1) {
    const [a, b] = [list[i - 1], list[i]];
    assert.ok(a.price < b.price || (a.price === b.price && a.id < b.id));
  }
});

test('Index Record-এর Copy নয়, একই Object (Memory দ্বিগুণ নয়)', () => {
  const [first] = indexedSearch(index, 'royal garden hotel');
  assert.equal(first, records.find((r) => r.id === first.id));
});
