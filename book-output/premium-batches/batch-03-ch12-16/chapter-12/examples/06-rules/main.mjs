import { count, increment } from './counter.mjs';
import { showCount } from './report.mjs';

increment();
increment();
console.log(count, showCount());
console.log(typeof this);

try {
  total = 5;
} catch (error) {
  console.log(error.name);
}

const { withVat } = await import('../04-modules/tax.mjs');
console.log(withVat(100));
