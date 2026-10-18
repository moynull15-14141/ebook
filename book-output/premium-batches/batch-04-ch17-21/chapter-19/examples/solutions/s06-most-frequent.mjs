import { createRandom, randomInts } from '../../project/perf-lab/src/random.mjs';

const mostNested = (items) => items.reduce((best, item) => {
  const count = items.filter((x) => x === item).length;
  return count > best.count || (count === best.count && item < best.value)
    ? { value: item, count }
    : best;
}, { value: undefined, count: 0 });

function mostMap(items) {
  const counts = new Map();
  let best = { value: undefined, count: 0 };
  for (const item of items) {
    const count = (counts.get(item) ?? 0) + 1;
    counts.set(item, count);
    if (count > best.count || (count === best.count && item < best.value)) {
      best = { value: item, count };
    }
  }
  return best;
}

const random = createRandom(7);
let same = true;
for (let round = 0; round < 50; round += 1) {
  const items = randomInts(random, 200, 30);
  same &&= JSON.stringify(mostNested(items)) === JSON.stringify(mostMap(items));
}
console.log(same);
