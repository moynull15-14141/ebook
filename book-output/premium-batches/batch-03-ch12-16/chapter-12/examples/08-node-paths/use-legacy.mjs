import legacy from './legacy/tax.js';
import { sourceTax } from './legacy/tax.js';

console.log(legacy.RATE, sourceTax(2000));
