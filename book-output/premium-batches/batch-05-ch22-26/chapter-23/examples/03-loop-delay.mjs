import { monitorEventLoopDelay } from 'node:perf_hooks';

const histogram = monitorEventLoopDelay({ resolution: 10 });
histogram.enable();

function blockFor(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // ইচ্ছাকৃতভাবে Event Loop আটকে রাখা (শিক্ষামূলক প্রদর্শন)
  }
}

setTimeout(() => blockFor(200), 50);
setTimeout(() => {
  histogram.disable();
  const ms = (ns) => (ns / 1e6).toFixed(1);
  console.log(`median ${ms(histogram.percentile(50))} ms, `
    + `p99 ${ms(histogram.percentile(99))} ms, max ${ms(histogram.max)} ms`);
}, 500);
