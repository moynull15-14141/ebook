import { fingerprintOf } from '../project/travel-saga/src/orchestrator.mjs';

// একই Idempotency Key, তিনটি অনুরোধ। Fingerprint বলে কোনটি সত্যিই "একই"।
const first = { bookingId: 'trip-7', customer: 'Rahim', seats: 2,
  amount: 1_250_000 };
const reordered = { amount: 1_250_000, seats: 2, customer: 'Rahim',
  bookingId: 'trip-7' };
const changed = { ...first, amount: 125_000 };

const short = (request) => fingerprintOf(request).slice(0, 12);
console.log('প্রথম:      ', short(first));
console.log('ক্রম বদলানো:', short(reordered), '(একই অনুরোধ)');
console.log('দাম বদলানো: ', short(changed), '(Conflict)');
