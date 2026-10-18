import { withVat, VAT_RATE } from './tax.mjs';
import describe, { withDiscount as applyDiscount } from './discount.mjs';
import * as tax from './tax.mjs';

console.log(`VAT ${VAT_RATE * 100}%: ${describe(withVat(1000))}`);
console.log(`ছাড়ের পর: ${describe(applyDiscount(1000, 10))}`);
console.log(tax.withVat(200), Object.keys(tax));
