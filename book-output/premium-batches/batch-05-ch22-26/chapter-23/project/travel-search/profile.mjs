// Profiling Lab (Node.js): User Timing দিয়ে প্রতিটি খোঁজের সময় এবং
// Inspector-এর CPU Profiler দিয়ে কোন Function সবচেয়ে বেশি সময় নেয়।
// সংখ্যাগুলো যন্ত্রভেদে বদলায়; এই Script কোনো Test-এর অংশ নয়।
import { PerformanceObserver, performance } from 'node:perf_hooks';
import { Session } from 'node:inspector/promises';
import { generateRecords } from './src/data.mjs';
import { buildIndex, naiveSearch, indexedSearch } from './src/search.mjs';
import { topFunctions } from './src/profile-report.mjs';

const durations = { naive: [], indexed: [] };
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((e) => durations[e.name].push(e.duration));
});
observer.observe({ entryTypes: ['measure'] });

function timed(name, fn) {
  performance.mark(`${name}-start`);
  fn();
  performance.measure(name, `${name}-start`);
}

const records = generateRecords();
const index = buildIndex(records);
const queries = ['sylhet', 'tea resort', 'go', 'river hill', 'dubai cruise'];

const session = new Session();
session.connect();
await session.post('Profiler.enable');
await session.post('Profiler.start');
for (let round = 0; round < 30; round += 1) {
  for (const q of queries) {
    timed('naive', () => naiveSearch(records, q));
    timed('indexed', () => indexedSearch(index, q));
  }
}
const { profile } = await session.post('Profiler.stop');
await new Promise((resolve) => setImmediate(resolve));
observer.disconnect();

const median = (list) => list.toSorted((a, b) => a - b)[list.length >> 1];
console.log(`Node.js ${process.version}, ${process.platform}; ১৫০টি করে খোঁজ`);
for (const [name, list] of Object.entries(durations)) {
  console.log(`${name.padEnd(8)} median ${median(list).toFixed(3)} ms`);
}
console.log('সবচেয়ে বেশি Self Time (CPU Profile):');
for (const f of topFunctions(profile, 4)) {
  console.log(`  ${f.percent}%  ${f.name}`);
}
