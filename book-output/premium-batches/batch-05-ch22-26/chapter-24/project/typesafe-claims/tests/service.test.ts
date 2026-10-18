import test from 'node:test';
import assert from 'node:assert/strict';
import type { Claim, ClaimId } from '../src/types.js';
import { createClaimService } from '../src/service.js';
import { MemoryRepository } from '../src/repository.js';
import { limitFor, describe } from '../src/policy.js';
import { nextStatus, statusLabel } from '../src/workflow.js';
import { toPaisa, formatTaka } from '../src/money.js';

function setup() {
  let n = 0;
  const newId = () => `EC-${++n}` as ClaimId;
  return createClaimService(new MemoryRepository<Claim, ClaimId>(), newId);
}
const meal = (amount: number) => ({ kind: 'meal', people: 2, amount });

test('তৈরি: মোট পরিমাণ, draft অবস্থা, ক্রমিক id', () => {
  const service = setup();
  const result = service.create({ employee: 'Sara', items: [meal(150_000), meal(50_000)] });
  assert.ok(result.ok);
  if (result.ok) {
    assert.equal(result.value.total, 200_000);
    assert.equal(result.value.status, 'draft');
    assert.equal(result.value.id, 'EC-1');
  }
});

test('নীতির সীমা: সীমায় চলে, এক পয়সা বেশিতে OVER_LIMIT', () => {
  const service = setup();
  assert.ok(service.create({ employee: 'Sara', items: [meal(200_000)] }).ok);
  const over = service.create({ employee: 'Sara', items: [meal(200_001)] });
  assert.deepEqual(over, { ok: false,
    error: { code: 'OVER_LIMIT', index: 0, limit: 200_000 } });
});

test('Workflow: সম্পূর্ণ পথ এবং অবৈধ কাজ', () => {
  const service = setup();
  const created = service.create({ employee: 'Rafi', items: [meal(1_000)] });
  assert.ok(created.ok);
  const id = 'EC-1' as ClaimId;
  assert.deepEqual(service.act(id, 'pay'), { ok: false,
    error: { code: 'INVALID_TRANSITION', from: 'draft', action: 'pay' } });
  for (const action of ['submit', 'approve', 'pay'] as const) {
    assert.ok(service.act(id, action).ok, action);
  }
  assert.deepEqual(service.summary(),
    { draft: 0, submitted: 0, approved: 0, rejected: 0, paid: 1 });
  assert.deepEqual(service.act('EC-9' as ClaimId, 'submit'),
    { ok: false, error: { code: 'NOT_FOUND', id: 'EC-9' } });
});

test('Repository-তে পুরোনো Object বদলায় না (Immutable হালনাগাদ)', () => {
  const service = setup();
  const created = service.create({ employee: 'Rafi', items: [meal(1_000)] });
  service.act('EC-1' as ClaimId, 'submit');
  assert.ok(created.ok && created.value.status === 'draft');
  assert.equal(service.list()[0]?.status, 'submitted');
  assert.equal(service.list()[0]?.itemCount, 1);
});

test('সহায়ক Function: সীমা, বর্ণনা, লেবেল, টাকা', () => {
  const hotel = { kind: 'hotel', city: 'Khulna', nights: 3, amount: toPaisa(1) } as const;
  assert.equal(limitFor(hotel), 2_400_000);
  assert.equal(describe(hotel), 'Khulna-এ 3 রাত হোটেল');
  assert.equal(statusLabel('rejected'), 'প্রত্যাখ্যাত');
  assert.equal(nextStatus('rejected', 'approve'), null);
  assert.equal(formatTaka(toPaisa(1_234_505)), '৳12,345.05');
  assert.throws(() => toPaisa(-1), RangeError);
  assert.throws(() => toPaisa(1.5), RangeError);
});
