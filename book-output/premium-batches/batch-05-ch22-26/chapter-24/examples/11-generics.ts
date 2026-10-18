function groupBy<T, K extends PropertyKey>(
  items: readonly T[], key: (item: T) => K,
) {
  const groups = {} as Record<K, T[]>;
  for (const item of items) {
    (groups[key(item)] ??= []).push(item);
  }
  return groups;
}

const tours = [
  { title: 'Sundarbans', days: 3, region: 'Khulna' },
  { title: 'Ratargul', days: 1, region: 'Sylhet' },
  { title: 'Jaflong', days: 1, region: 'Sylhet' },
];

const byRegion = groupBy(tours, (tour) => tour.region);
const byLength = groupBy(tours, (tour) => (tour.days > 1 ? 'long' : 'short'));
console.log(Object.keys(byRegion), byLength.short?.map((t) => t.title));
