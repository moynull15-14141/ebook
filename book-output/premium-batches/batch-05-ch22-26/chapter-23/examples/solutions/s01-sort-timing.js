const numbers = Array.from({ length: 20_000 }, (_, i) => (i * 7919) % 20_000);

performance.mark('sort-start');
const sorted = numbers.toSorted((a, b) => a - b);
performance.mark('sort-end');

const [entry] = performance.getEntriesByName(
  performance.measure('sort', 'sort-start', 'sort-end').name);
console.log(entry.name, entry.entryType, sorted[0], sorted.at(-1));
