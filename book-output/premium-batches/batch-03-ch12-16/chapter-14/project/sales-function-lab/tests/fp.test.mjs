// Functional সরঞ্জামের Test। Debounce ও Throttle-এর Test Fake Timer দিয়ে: সময় হাতে এগোয়, তাই ফল নিশ্চিত ও তাৎক্ষণিক।
// চালানোর Command (Project Folder থেকে):  node --test
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { pipe, compose, curry, memoize, once, debounce, throttle } from '../src/fp.mjs';

const add10 = (n) => n + 10;
const double = (n) => n * 2;

test('pipe: বাঁ থেকে ডানে; কোনো Function না দিলে ইনপুটই ফেরত', () => {
  assert.equal(pipe(add10, double)(1), 22);
  assert.equal(pipe()(7), 7);
});

test('compose: ডান থেকে বাঁয়ে; compose(f, g) = pipe(g, f)', () => {
  assert.equal(compose(add10, double)(1), 12);
  assert.equal(compose(add10, double)(5), pipe(double, add10)(5));
});

test('curry: Argument একসঙ্গে, এক এক করে, বা মিশিয়ে', () => {
  const volume = curry((a, b, c) => a * b * c);
  assert.equal(volume(2, 3, 4), 24);
  assert.equal(volume(2)(3)(4), 24);
  assert.equal(volume(2, 3)(4), 24);
  assert.equal(typeof volume(2)(3), 'function');
});

test('memoize: একই Argument-এ আসল Function একবারই; ভিন্ন Argument-এ নতুন হিসাব', () => {
  const spy = mock.fn((a, b) => a + b);
  const fast = memoize(spy);
  assert.equal(fast(1, 2), 3);
  assert.equal(fast(1, 2), 3);
  assert.equal(fast(2, 1), 3);
  assert.equal(spy.mock.callCount(), 2);
  assert.equal(fast.cacheSize(), 2);
});

test('memoize: নিজস্ব keyOf; Object-এর বিষয়বস্তু ধরে Key', () => {
  const spy = mock.fn((user) => user.name.toUpperCase());
  const fast = memoize(spy, (user) => user.id);
  fast({ id: 1, name: 'sara' });
  assert.equal(fast({ id: 1, name: 'অন্য নাম' }), 'SARA');
  assert.equal(spy.mock.callCount(), 1);
});

test('once: প্রথম ফল মনে রাখে; পরের ডাকে আসল Function চলে না', () => {
  const spy = mock.fn((x) => x * 10);
  const init = once(spy);
  assert.equal(init(1), 10);
  assert.equal(init(2), 10);
  assert.equal(spy.mock.callCount(), 1);
});

test('debounce: দ্রুত চারটি ডাকে শেষটির পর একবার, শেষ Argument দিয়ে', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const spy = mock.fn();
    const search = debounce(spy, 300);
    for (const text of ['J', 'Ja', 'Jav', 'Java']) {
      search(text);
      mock.timers.tick(100);
    }
    assert.equal(spy.mock.callCount(), 0);
    mock.timers.tick(199);
    assert.equal(spy.mock.callCount(), 0);
    mock.timers.tick(1);
    assert.equal(spy.mock.callCount(), 1);
    assert.deepEqual(spy.mock.calls[0].arguments, ['Java']);
  } finally {
    mock.timers.reset();
  }
});

test('debounce: বিরতির পর আবার ডাকলে আবার চলে', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const spy = mock.fn();
    const save = debounce(spy, 50);
    save(1);
    mock.timers.tick(50);
    save(2);
    mock.timers.tick(50);
    assert.deepEqual(spy.mock.calls.map((call) => call.arguments[0]), [1, 2]);
  } finally {
    mock.timers.reset();
  }
});

test('throttle: প্রতি 10 ms-এ 50টি ঘটনা (500 ms), 100 ms-এ একবার: ঠিক 5 বার', () => {
  mock.timers.enable({ apis: ['Date'], now: 1_000_000 });
  try {
    const spy = mock.fn();
    const onScroll = throttle(spy, 100);
    for (let i = 0; i < 50; i += 1) {
      onScroll(i);
      mock.timers.tick(10);
    }
    assert.equal(spy.mock.callCount(), 5);
    assert.deepEqual(spy.mock.calls.map((call) => call.arguments[0]), [0, 10, 20, 30, 40]);
  } finally {
    mock.timers.reset();
  }
});

test('throttle: প্রথম ঘটনা সঙ্গে সঙ্গে চলে', () => {
  mock.timers.enable({ apis: ['Date'], now: 5 });
  try {
    const spy = mock.fn();
    throttle(spy, 1000)('now');
    assert.equal(spy.mock.callCount(), 1);
  } finally {
    mock.timers.reset();
  }
});
