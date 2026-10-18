import test from 'node:test';
import assert from 'node:assert/strict';

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

test('৩০০ ms-এর মধ্যে তিন ডাকে একবার, শেষ মান দিয়ে', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const search = t.mock.fn();
  const debounced = debounce(search, 300);
  debounced('ঢা');
  t.mock.timers.tick(100);
  debounced('ঢাকা');
  t.mock.timers.tick(299);
  assert.equal(search.mock.callCount(), 0);
  t.mock.timers.tick(1);
  assert.deepEqual(search.mock.calls.map((c) => c.arguments[0]), ['ঢাকা']);
});
