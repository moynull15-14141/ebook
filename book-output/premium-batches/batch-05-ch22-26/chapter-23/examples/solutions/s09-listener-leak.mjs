import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';

setFlagsFromString('--expose-gc');
const gc = runInNewContext('gc');
const heapMB = () => {
  gc();
  return process.memoryUsage().heapUsed / 1024 / 1024;
};

const bus = new EventTarget();
function openPanel(signal) {
  const bigState = new Array(20_000).fill('x');
  bus.addEventListener('refresh', () => bigState.length, { signal });
}

const start = heapMB();
for (let i = 0; i < 200; i += 1) {
  openPanel();
}
const leaked = heapMB() - start;

const controllers = [];
for (let i = 0; i < 200; i += 1) {
  const controller = new AbortController();
  openPanel(controller.signal);
  controllers.push(controller);
}
const beforeAbort = heapMB();
controllers.forEach((c) => c.abort());
await new Promise((resolve) => setTimeout(resolve, 0));
const freed = beforeAbort - heapMB();

console.log(`Signal ছাড়া: ২০ MB-র বেশি আটকে আছে: ${leaked > 20}`);
console.log(`abort()-এর পর ২০ MB-র বেশি মুক্ত: ${freed > 20}`);
