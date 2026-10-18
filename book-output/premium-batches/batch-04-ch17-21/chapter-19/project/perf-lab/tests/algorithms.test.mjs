// Algorithm-জোড়ার Correctness Test: দ্রুত সংস্করণ ধীরটির সঙ্গে হুবহু মেলে কি না।
// চালানোর Command (Project Folder থেকে):  node --test
// কোনো Test সময় মাপে না; Seed-যুক্ত ইনপুট, তাই ব্যর্থ হলে একই ইনপুট আবার পাওয়া যায়।
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRandom, randomInts } from '../src/random.mjs';
import * as algo from '../src/algorithms.mjs';

const ROUNDS = 100;

function eachRandomCase(seed, check) {
  const random = createRandom(seed);
  for (let round = 0; round < ROUNDS; round += 1) {
    const size = Math.floor(random() * 60);
    const max = 1 + Math.floor(random() * 40);
    check(randomInts(random, size, max), randomInts(random, size, max), round);
  }
}

test('uniqueSet === uniqueNested, ১০০টি Seed-যুক্ত ইনপুটে', () => {
  eachRandomCase(1, (a, _b, round) => {
    assert.deepEqual(algo.uniqueSet(a), algo.uniqueNested(a), `round ${round}`);
  });
});

test('commonSet === commonNested, ১০০টি Seed-যুক্ত ইনপুটে', () => {
  eachRandomCase(2, (a, b, round) => {
    assert.deepEqual(algo.commonSet(a, b), algo.commonNested(a, b), `round ${round}`);
  });
});

test('indexOfBinary === indexOfLinear: উপস্থিত, অনুপস্থিত ও পুনরাবৃত্ত মান', () => {
  eachRandomCase(3, (a, _b, round) => {
    const sorted = a.toSorted((x, y) => x - y);
    for (let target = -1; target <= 41; target += 1) {
      assert.equal(algo.indexOfBinary(sorted, target),
        algo.indexOfLinear(sorted, target), `round ${round}, target ${target}`);
    }
  });
});

test('Binary Search-এর সীমার ক্ষেত্র', () => {
  assert.equal(algo.indexOfBinary([], 5), -1);
  assert.equal(algo.indexOfBinary([5], 5), 0);
  assert.equal(algo.indexOfBinary([1, 2, 3], 1), 0);
  assert.equal(algo.indexOfBinary([1, 2, 3], 3), 2);
  assert.equal(algo.indexOfBinary([2, 2, 2, 2], 2), 0);
  assert.equal(algo.indexOfBinary([1, 3, 3, 3, 9], 3), 1);
});

test('uniqueSet প্রথম দেখার ক্রম রাখে', () => {
  assert.deepEqual(algo.uniqueSet([3, 1, 3, 2, 1]), [3, 1, 2]);
});

test('common: a-র পুনরাবৃত্তি ও ক্রম দুই সংস্করণেই একই', () => {
  assert.deepEqual(algo.commonSet([1, 1, 2, 4], [4, 1]), [1, 1, 4]);
  assert.deepEqual(algo.commonNested([1, 1, 2, 4], [4, 1]), [1, 1, 4]);
});

test('createRandom: একই Seed-এ একই ক্রম, ভিন্ন Seed-এ ভিন্ন', () => {
  const take = (seed) => randomInts(createRandom(seed), 10, 1000);
  assert.deepEqual(take(2026), take(2026));
  assert.notDeepEqual(take(2026), take(2027));
});

test('randomInts: সব মান 0 থেকে max-এর কম, পূর্ণসংখ্যা', () => {
  const values = randomInts(createRandom(9), 1000, 7);
  assert.equal(values.length, 1000);
  assert.ok(values.every((n) => Number.isInteger(n) && n >= 0 && n < 7));
  assert.equal(new Set(values).size, 7);
});
