// Runtime Test: TypeScript Runtime-এ নেই, তাই unknown ইনপুটের যাচাই Test করতে হয়।
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNewClaim } from '../src/parse.js';

const hotel = { kind: 'hotel', city: ' Sylhet ', nights: 2, amount: 900_000 };

test('বৈধ ইনপুট: Type-যুক্ত NewClaim, লেখা পরিষ্কার', () => {
  const result = parseNewClaim({ employee: ' Rafi ', items: [hotel] });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.employee, 'Rafi');
    assert.deepEqual(result.value.items[0],
      { kind: 'hotel', city: 'Sylhet', nights: 2, amount: 900_000 });
  }
});

test('বাড়তি Field (যেমন status, total) গ্রহণ করা হয় না', () => {
  const result = parseNewClaim({
    employee: 'Rafi', status: 'paid', total: 1,
    items: [{ ...hotel, approved: true }],
  });
  assert.ok(result.ok);
  if (result.ok) {
    assert.equal('status' in result.value, false);
    assert.equal('approved' in (result.value.items[0] ?? {}), false);
  }
});

test('প্রতিটি ভুলের পথ ও বার্তা', () => {
  const result = parseNewClaim({
    employee: '',
    items: [
      { kind: 'meal', people: 0, amount: 5 },
      { kind: 'transport', mode: 'rocket', amount: 10 },
      { kind: 'spa', amount: 10 },
      { kind: 'visa', country: 'Japan', amount: -1 },
      'text',
    ],
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.deepEqual(result.error.map((i) => i.path), [
      'employee', 'items[0].people', 'items[1].mode', 'items[2].kind',
      'items[3].amount', 'items[4]',
    ]);
  }
});

test('ধরনের ভুল: সংখ্যার জায়গায় লেখা, Object-এর জায়গায় Array', () => {
  for (const input of [null, [], 'claim', { employee: 'A', items: 'x' },
    { employee: 'A', items: [{ ...hotel, nights: '2' }] },
    { employee: 'A', items: [{ ...hotel, amount: 1.5 }] }]) {
    assert.equal(parseNewClaim(input).ok, false, JSON.stringify(input));
  }
});
