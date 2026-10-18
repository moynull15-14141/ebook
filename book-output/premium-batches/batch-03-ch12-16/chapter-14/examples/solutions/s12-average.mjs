import { curry } from '../../project/sales-function-lab/src/fp.mjs';
import {
  partitionValid, sumBy,
} from '../../project/sales-function-lab/src/sales.mjs';
import { SALES } from '../../project/sales-function-lab/data/sales.mjs';

const averageBy = curry((field, rows) =>
  (rows.length === 0 ? 0 : Math.round(sumBy(field, rows) / rows.length)));

const { valid } = partitionValid(SALES);
const groups = Object.groupBy(valid, (sale) => sale.category);

for (const [category, rows] of Object.entries(groups)) {
  console.log(`${category}: গড় ${averageBy('total', rows)}`);
}
