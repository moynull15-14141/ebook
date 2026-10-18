import { increment } from './counter.mjs';

const again = await import('./counter.mjs');
increment();
console.log(again.increment(), again.increment === increment);
