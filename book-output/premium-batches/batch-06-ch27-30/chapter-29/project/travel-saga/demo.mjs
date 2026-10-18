import { startSystem } from './src/system.mjs';

const system = await startSystem({ seats: 10,
  callOptions: { timeoutMs: 150, retries: 1, random: () => 0.5 } });
const { orchestrator, inventory, payment } = system;

async function attempt(label, request) {
  try {
    const result = await orchestrator.book(request);
    console.log(`${label}: ${result.status}${result.reason
      ? ` (${result.reason})` : ''}`);
  } catch (error) {
    console.log(`${label}: ${error.code}`);
  }
}

const trip = { bookingId: 'trip-101', customer: 'Rahim', seats: 2,
  amount: 1_250_000 };
await attempt('১. সাধারণ Booking', trip);
await attempt('২. একই অনুরোধ আবার', trip);
await attempt('৩. একই ID, ভিন্ন দাম', { ...trip, amount: 1 });

payment.faults.decline.add('Karim');
await attempt('৪. Card প্রত্যাখ্যাত', { bookingId: 'trip-102',
  customer: 'Karim', seats: 3, amount: 900_000 });

inventory.faults.failNext = 1;
await attempt('৫. Inventory সাময়িক 503', { bookingId: 'trip-103',
  customer: 'Mina', seats: 1, amount: 450_000 });

await attempt('৬. আসন নেই', { bookingId: 'trip-104', customer: 'Rafi',
  seats: 8, amount: 100_000 });

payment.faults.delayMs = 300; // টাকা কাটে, কিন্তু উত্তর আসে Timeout-এর পরে
await attempt('৭. Payment-এর উত্তর অনিশ্চিত', { bookingId: 'trip-105',
  customer: 'Nadia', seats: 1, amount: 300_000 });
payment.faults.delayMs = 0;

console.log('Inventory:', await system.stock());
console.log('Payment:', await system.ledger());
console.log('Outbox-এর Event:');
for (const event of system.store.pendingEvents()) {
  console.log(`  ${event.saga_id} ${event.type}`);
}
console.log('trip-105-এর ইতিহাস:', system.store.history('trip-105')
  .map((h) => h.status).join(' > '));
await system.close();
