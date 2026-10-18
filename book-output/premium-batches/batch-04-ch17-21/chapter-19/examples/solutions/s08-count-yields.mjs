import { processInChunks } from '../../project/perf-lab/src/chunk.mjs';

let pauses = 0;
const items = Array.from({ length: 10000 }, (_, i) => i);
const results = await processInChunks(items, (n) => n * 2, {
  size: 1000,
  yieldFn: async () => {
    pauses += 1;
  },
});

console.log(results.length, results.at(-1), pauses);
