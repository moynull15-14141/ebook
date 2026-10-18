import { CUSTOMERS, PRODUCTS, sampleLoader } from './data/sample.mjs';
import { loadInBatches } from './src/load.mjs';
import { validateOrder } from './src/validate.mjs';
import {
  applyRefund, flattenOrders, joinLines, pivotRegionMonth, topCustomers, totalOf,
} from './src/transform.mjs';

const months = ['2026-01', '2026-02', '2026-03', '2026-04'];
const { records, failures } = await loadInBatches(months, sampleLoader);

const results = records.map(validateOrder);
const orders = results.filter((r) => r.ok).map((r) => r.value);
const invalid = results.filter((r) => !r.ok).map((r) => r.error);

const corrected = applyRefund(orders, { orderId: 'O5', sku: 'B1', qty: 2 });
const lines = flattenOrders(corrected);
const { joined, unmatched } = joinLines(lines, PRODUCTS, CUSTOMERS);
const pivot = pivotRegionMonth(joined);

console.log(`Order: ${records.length}, বৈধ ${orders.length};`,
  `বাদ: ${invalid.join('; ')}`);
console.log(`File ব্যর্থ: ${failures.join('; ')}; অমিল: ${unmatched.join(', ')}`);
console.log(pivot);
console.log(topCustomers(joined).map((c) => `${c.name} ${c.total}`).join(', '));

const pivotTotal = Object.values(pivot)
  .flatMap((months) => Object.values(months))
  .reduce((a, b) => a + b, 0);
console.log(`Invariant: ${pivotTotal === totalOf(joined)} (${pivotTotal})`);
console.log(corrected[0] === orders[0], corrected.at(-1) === orders.at(-1));
