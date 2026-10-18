import { createHash } from 'node:crypto';

// Key ও Fingerprint একসঙ্গে: Key বলে "কোন অনুরোধ", Fingerprint বলে "কী চাওয়া"।
const sha = (value) => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');
const saved = new Map(); // আসলে: Database Table, Key-তে UNIQUE

function handle(key, body, work) {
  const fingerprint = sha(body);
  const old = saved.get(key);
  if (old && old.fingerprint !== fingerprint) {
    return { status: 409, body: { error: 'IDEMPOTENCY_CONFLICT' } };
  }
  if (old) return { ...old.response, replay: true };
  const response = work(body);
  saved.set(key, { fingerprint, response });
  return response;
}

let charges = 0;
const charge = (body) => {
  charges += 1;
  return { status: 201, body: { charged: body.amount } };
};

console.log(handle('k-1', { amount: 500 }, charge));
console.log(handle('k-1', { amount: 500 }, charge));
console.log(handle('k-1', { amount: 900 }, charge));
console.log('আসলে টাকা কাটা হয়েছে:', charges, 'বার');
