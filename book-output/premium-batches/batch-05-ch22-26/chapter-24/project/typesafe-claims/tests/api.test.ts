import test from 'node:test';
import assert from 'node:assert/strict';
import type { Claim, ClaimId } from '../src/types.js';
import { createClaimService } from '../src/service.js';
import { MemoryRepository } from '../src/repository.js';
import { handle } from '../src/api.js';

function setup() {
  let n = 0;
  const repository = new MemoryRepository<Claim, ClaimId>();
  return createClaimService(repository, () => `EC-${++n}` as ClaimId);
}
const body = { employee: 'Mina', items: [{ kind: 'visa', country: 'Japan', amount: 500_000 }] };

test('HTTP Status: 201, 200, 422, 404, 409', () => {
  const service = setup();
  const post = (path: string, data?: unknown) =>
    handle(service, { method: 'POST', path, body: data }).status;
  assert.equal(post('/claims', body), 201);
  assert.equal(post('/claims', { employee: 'Mina', items: [] }), 422);
  assert.equal(post('/claims/EC-1/submit'), 200);
  assert.equal(post('/claims/EC-1/submit'), 409);
  assert.equal(post('/claims/EC-7/submit'), 404);
  assert.equal(post('/claims/EC-1/delete'), 404);
  assert.equal(handle(service, { method: 'GET', path: '/claims' }).status, 200);
  assert.equal(handle(service, { method: 'DELETE', path: '/claims' }).status, 404);
});

test('ব্যর্থতার Body-তে code ও বিস্তারিত', () => {
  const service = setup();
  const response = handle(service, { method: 'POST', path: '/claims',
    body: { employee: 'Mina', items: [{ kind: 'visa', country: 'Japan',
      amount: 2_000_000 }] } });
  assert.deepEqual(response,
    { status: 422, body: { code: 'OVER_LIMIT', index: 0, limit: 1_500_000 } });
});
