import { SALES } from './data/sales.mjs';
import {
  atLeast, inCategory, partitionValid, salesReport,
} from './src/sales.mjs';
import { formatTaka, formatterFor } from './src/format.mjs';

const report = salesReport(SALES);

console.log(`মোট আয়: ${formatTaka(report.revenue)}`);
for (const { category, count, revenue } of report.byCategory) {
  console.log(`${category}: ${count}টি বিক্রি, ${formatTaka(revenue)}`);
}
console.log(`শীর্ষ ৩: ${report.top.join(', ')}`);
for (const reason of report.rejected) {
  console.log(`বাদ: ${reason}`);
}

const { valid } = partitionValid(SALES);
const bigBooks = valid.filter(inCategory('Books')).filter(atLeast(1000));
console.log(`১০০০+ টাকার বই: ${bigBooks.map((sale) => sale.id).join(', ')}`);
console.log(formatTaka(1234.5, 2), formatterFor.cacheSize(), SALES[5].quantity);
