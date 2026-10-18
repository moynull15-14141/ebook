performance.mark('filter-start');
const items = Array.from({ length: 50_000 }, (_, i) => i);
const even = items.filter((n) => n % 2 === 0);
performance.mark('filter-end');

const entry = performance.measure('filter', 'filter-start', 'filter-end');
console.log(entry.name, entry.entryType, even.length);
console.log(performance.getEntriesByName('filter').length, typeof entry.duration);
