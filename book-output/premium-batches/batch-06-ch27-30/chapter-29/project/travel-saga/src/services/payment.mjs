import { serveJson } from './http-util.mjs';

// Payment Service (অনুকরণ, আসল Gateway নয়)। chargeId দিয়ে Idempotent:
// একই chargeId ও একই Amount-এ আগের ফল, ভিন্ন Amount-এ 409।
export async function startPayment() {
  const charges = new Map();
  const faults = { failNext: 0, delayMs: 0, decline: new Set() };

  function route(method, [resource, id, action], body) {
    if (method === 'GET' && resource === 'ledger') {
      const all = [...charges.values()];
      const sum = (status) => all.filter((c) => c.status === status)
        .reduce((total, c) => total + c.amount, 0);
      return [200, { captured: sum('CAPTURED'), refunded: sum('REFUNDED'),
        attempts: all.length }];
    }
    if (method === 'POST' && resource === 'charges' && !id) {
      if (faults.failNext > 0) {
        faults.failNext -= 1;
        return [503, { error: 'UNAVAILABLE' }];
      }
      const old = charges.get(body.chargeId);
      if (old && old.amount !== body.amount) {
        return [409, { error: 'IDEMPOTENCY_CONFLICT' }];
      }
      if (!old) {
        const declined = faults.decline.has(body.customer);
        charges.set(body.chargeId, { chargeId: body.chargeId,
          amount: body.amount, status: declined ? 'DECLINED' : 'CAPTURED' });
      }
      const charge = charges.get(body.chargeId);
      // delayMs: টাকা কাটা হয়ে গেছে, কিন্তু উত্তর দেরিতে; Client Timeout পায়।
      if (charge.status === 'DECLINED') return [402, { ...charge }];
      return [old ? 200 : 201, { ...charge }, faults.delayMs];
    }
    if (method === 'POST' && resource === 'charges' && action === 'refund') {
      const charge = charges.get(id);
      if (charge?.status !== 'CAPTURED') return [200, { refunded: false }];
      charge.status = 'REFUNDED';
      return [200, { refunded: true }];
    }
    return [404, { error: 'NOT_FOUND' }];
  }

  const server = await serveJson(route);
  return { ...server, charges, faults };
}
