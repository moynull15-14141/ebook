import type { ClaimId } from './types.js';
import { createClaimService } from './service.js';
import { MemoryRepository } from './repository.js';
import { handle } from './api.js';
import { formatTaka } from './money.js';
import { statusLabel } from './workflow.js';
import type { Claim } from './types.js';

let counter = 0;
const newId = () => `EC-${String(++counter).padStart(3, '0')}` as ClaimId;
const service = createClaimService(new MemoryRepository<Claim, ClaimId>(), newId);

// JSON.parse-এর ফল unknown-এর মতোই: বাইরের তথ্য, যাচাই না হওয়া পর্যন্ত।
const body: unknown = JSON.parse(`{
  "employee": "Mina Akter",
  "items": [
    { "kind": "hotel", "city": "Cox's Bazar", "nights": 2, "amount": 1200000 },
    { "kind": "transport", "mode": "bus", "amount": 180000 }
  ]
}`);

const created = handle(service, { method: 'POST', path: '/claims', body });
console.log(created.status, JSON.stringify(created.body).slice(0, 44));

const result = service.act('EC-001' as ClaimId, 'submit');
if (result.ok) {
  const { id, status, total } = result.value;
  console.log(id, statusLabel(status), formatTaka(total));
}

const bad = handle(service, {
  method: 'POST', path: '/claims',
  body: { employee: '', items: [{ kind: 'meal', people: 0, amount: 5 }] },
});
console.log(bad.status, JSON.stringify(bad.body));

const twice = handle(service, { method: 'POST', path: '/claims/EC-001/pay' });
console.log(twice.status, JSON.stringify(twice.body));
