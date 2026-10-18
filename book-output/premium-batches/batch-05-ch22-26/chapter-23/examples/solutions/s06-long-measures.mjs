import { PerformanceObserver, performance } from 'node:perf_hooks';

const slow = [];
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 5) {
      slow.push(entry.name);
    }
  }
});
observer.observe({ entryTypes: ['measure'] });

function work(name, ms) {
  performance.mark(name);
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // নির্দিষ্ট সময় ব্যস্ত থাকা
  }
  performance.measure(name, name);
}

work('quick', 0);
work('report', 40);
setTimeout(() => {
  observer.disconnect();
  console.log(slow);
}, 0);
