// Bulkhead: প্রতিটি Dependency-র জন্য আলাদা সীমিত "কক্ষ"। ধীর Payment
// সব সংযোগ দখল করলেও Inventory-র ডাক আটকে যায় না।
function createBulkhead(limit) {
  let active = 0;
  let rejected = 0;
  return {
    async run(task) {
      if (active >= limit) {
        rejected += 1;
        throw new Error('BULKHEAD_FULL');
      }
      active += 1;
      try {
        return await task();
      } finally {
        active -= 1;
      }
    },
    stats: () => ({ active, rejected }),
  };
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const payment = createBulkhead(3);
const inventory = createBulkhead(3);

// Payment ধীর: ১০টি ডাক একসঙ্গে, প্রতিটি ১০০ ms।
const slow = Array.from({ length: 10 }, () =>
  payment.run(() => wait(100)).catch((e) => e.message));
const fast = await inventory.run(async () => 'Inventory: উত্তর এল');
console.log(fast);
const results = await Promise.all(slow);
console.log('Payment:', results.filter((r) => r === 'BULKHEAD_FULL').length,
  'টি সঙ্গে সঙ্গে প্রত্যাখ্যাত,', results.filter((r) => r === undefined)
    .length, 'টি সম্পন্ন');
console.log(payment.stats());
