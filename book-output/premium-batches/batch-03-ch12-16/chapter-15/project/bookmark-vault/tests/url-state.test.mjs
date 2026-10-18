// URL ও ছাঁকনির রূপান্তরের Test (Node.js)।  চালানোর Command:  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFilters, filtersToSearch } from '../src/url-state.mjs';

const none = { query: '', tag: '', favoritesOnly: false };

test('readFilters: খালি বা অচেনা URL-এ Default', () => {
  assert.deepEqual(readFilters(''), none);
  assert.deepEqual(readFilters('?other=1&fav=yes'), none);
});

test('readFilters: সব ছাঁকনি, Encode করা অক্ষরসহ', () => {
  assert.deepEqual(readFilters('?q=node+%26+npm&tag=docs&fav=1'), { query: 'node & npm', tag: 'docs', favoritesOnly: true });
  assert.equal(readFilters('?q=%E0%A6%AC%E0%A6%87').query, 'বই');
});

test('filtersToSearch: খালি ছাঁকনিতে খালি লেখা; শুধু ব্যবহৃত অংশ; trim', () => {
  assert.equal(filtersToSearch(none), '');
  assert.equal(filtersToSearch({ ...none, query: '  node ' }), '?q=node');
  assert.equal(filtersToSearch({ ...none, favoritesOnly: true }), '?fav=1');
});

test('Round-Trip: URL-এ নিয়ে আবার পড়লে একই ছাঁকনি (trim করা শব্দ বাদে)', () => {
  const cases = [
    { query: 'node & npm', tag: 'docs', favoritesOnly: true },
    { query: 'বাংলা বই', tag: '', favoritesOnly: false },
    none,
  ];
  for (const filters of cases) {
    assert.deepEqual(readFilters(filtersToSearch(filters)), filters);
  }
  assert.equal(readFilters(filtersToSearch({ ...none, query: ' x ' })).query, 'x');
});

test('URL-এ যেকোনো লেখা এলেও ত্রুটি নয়', () => {
  assert.doesNotThrow(() => readFilters('?q=%ZZ&tag=<script>'));
  assert.equal(readFilters('?tag=<script>').tag, '<script>');
});
