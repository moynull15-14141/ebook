import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';

setFlagsFromString('--expose-gc');
const gc = runInNewContext('gc');
const heapMB = () => {
  gc();
  return process.memoryUsage().heapUsed / 1024 / 1024;
};

function fillCache(cache, limit) {
  for (let i = 0; i < 400; i += 1) {
    cache.set(`report-${i}`, new Array(10_000).fill(i));
    if (cache.size > limit) {
      cache.delete(cache.keys().next().value);
    }
  }
}

const before = heapMB();
const unbounded = new Map();
fillCache(unbounded, Infinity);
const afterUnbounded = heapMB();
const bounded = new Map();
fillCache(bounded, 20);
const afterBounded = heapMB();

const grewBy = (a, b) => b - a;
console.log(`সীমাহীন Cache-এ Heap ৩০ MB-র বেশি বেড়েছে: ${grewBy(before, afterUnbounded) > 30}`);
console.log(`সীমিত Cache-এ বাড়তি ৫ MB-র কম: ${grewBy(afterUnbounded, afterBounded) < 5}`);
console.log(unbounded.size, bounded.size);
