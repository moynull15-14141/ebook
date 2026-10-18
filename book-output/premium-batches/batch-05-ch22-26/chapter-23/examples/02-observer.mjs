import { PerformanceObserver, performance } from 'node:perf_hooks';

const seen = [];
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => seen.push(entry.name));
});
observer.observe({ entryTypes: ['measure'] });

for (const step of ['load', 'index', 'search']) {
  performance.mark(`${step}-start`);
  performance.measure(step, `${step}-start`);
}

setTimeout(() => {
  observer.disconnect();
  console.log(seen.join(' > '));
}, 0);
