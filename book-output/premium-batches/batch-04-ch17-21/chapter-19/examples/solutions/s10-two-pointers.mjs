import { createRandom, randomInts } from '../../project/perf-lab/src/random.mjs';
import { commonSet } from '../../project/perf-lab/src/algorithms.mjs';

function commonSorted(a, b) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) {
      i += 1;
    } else if (a[i] > b[j]) {
      j += 1;
    } else {
      result.push(a[i]);
      i += 1;
      j += 1;
    }
  }
  return result;
}

const random = createRandom(42);
const unique = (n) =>
  [...new Set(randomInts(random, n, 500))].toSorted((x, y) => x - y);
const a = unique(300);
const b = unique(300);

const fast = JSON.stringify(commonSorted(a, b));
const same = fast === JSON.stringify(commonSet(a, b));
console.log(same);
