// Virtual Scrolling-এর হিসাব: শুরু, মাঝখান, শেষ, এবং সীমার ক্ষেত্র।
import test from 'node:test';
import assert from 'node:assert/strict';
import { visibleRange, offsetOf } from '../src/virtual.mjs';

const base = { viewport: 480, rowHeight: 48, total: 12_000, overscan: 5 };

test('শুরুতে: ০ থেকে ১০টি দৃশ্যমান + ৫টি বাড়তি', () => {
  assert.deepEqual(visibleRange({ ...base, scrollTop: 0 }), { start: 0, end: 15 });
});

test('মাঝখানে: দুই পাশে ৫টি করে বাড়তি', () => {
  assert.deepEqual(visibleRange({ ...base, scrollTop: 48_000 }),
    { start: 995, end: 1_015 });
});

test('শেষে: total-এর বাইরে নয়', () => {
  const scrollTop = 12_000 * 48 - 480;
  assert.deepEqual(visibleRange({ ...base, scrollTop }), { start: 11_985, end: 12_000 });
});

test('আধা সারি Scroll: আংশিক দেখা সারিও আঁকা হয়', () => {
  assert.deepEqual(visibleRange({ ...base, scrollTop: 24, overscan: 0 }),
    { start: 0, end: 11 });
});

test('সীমার ক্ষেত্র: ফাঁকা তালিকা, ঋণাত্মক scrollTop, ছোট তালিকা', () => {
  assert.deepEqual(visibleRange({ ...base, total: 0, scrollTop: 0 }), { start: 0, end: 0 });
  assert.deepEqual(visibleRange({ ...base, scrollTop: -100 }), { start: 0, end: 15 });
  assert.deepEqual(visibleRange({ ...base, total: 3, scrollTop: 0 }), { start: 0, end: 3 });
});

test('যত বড় তালিকাই হোক, আঁকা সারির সংখ্যা স্থির', () => {
  for (const total of [1_000, 12_000, 1_000_000]) {
    const { start, end } = visibleRange({ ...base, total, scrollTop: 4_800 });
    assert.equal(end - start, 20);
  }
  assert.equal(offsetOf(995, 48), 47_760);
});
