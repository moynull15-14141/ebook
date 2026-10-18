// LRU Cache-এর Test: Eviction-এর ক্রম, মেয়াদ (কৃত্রিম ঘড়ি), পরিসংখ্যান।
// চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { LruCache } from '../src/lru.mjs';

test('ভর্তি হলে সবচেয়ে পুরোনো ব্যবহৃত Entry বাদ', () => {
  const cache = new LruCache({ limit: 2 });
  cache.set('a', 1);
  cache.set('b', 2);
  cache.set('c', 3);
  assert.equal(cache.get('a'), undefined);
  assert.equal(cache.get('b'), 2);
  assert.equal(cache.get('c'), 3);
  assert.equal(cache.size, 2);
});

test('get একটি Entry-কে সাম্প্রতিক করে, তাই সেটি বাদ পড়ে না', () => {
  const cache = new LruCache({ limit: 2 });
  cache.set('a', 1);
  cache.set('b', 2);
  cache.get('a');
  cache.set('c', 3);
  assert.equal(cache.get('a'), 1);
  assert.equal(cache.get('b'), undefined);
});

test('মেয়াদোত্তীর্ণ Entry পড়লে undefined এবং মুছে যায় (কৃত্রিম ঘড়ি)', () => {
  let time = 1000;
  const cache = new LruCache({ limit: 5, ttlMs: 100, now: () => time });
  cache.set('rate', 117);
  time = 1099;
  assert.equal(cache.get('rate'), 117);
  time = 1100;
  assert.equal(cache.get('rate'), undefined);
  assert.equal(cache.size, 0);
});

test('পরিসংখ্যান: hits, misses, evictions', () => {
  const cache = new LruCache({ limit: 1 });
  cache.get('x');
  cache.set('x', 1);
  cache.get('x');
  cache.set('y', 2);
  assert.deepEqual(cache.stats, { hits: 1, misses: 1, evictions: 1 });
});

test('একই Key আবার set করলে মান বদলায়, Eviction হয় না', () => {
  const cache = new LruCache({ limit: 2 });
  cache.set('a', 1);
  cache.set('b', 2);
  cache.set('a', 10);
  assert.equal(cache.size, 2);
  assert.equal(cache.stats.evictions, 0);
  assert.equal(cache.get('a'), 10);
});

test('অবৈধ limit-এ RangeError', () => {
  for (const limit of [0, -1, 1.5, '3', undefined]) {
    assert.throws(() => new LruCache({ limit }), RangeError);
  }
});
