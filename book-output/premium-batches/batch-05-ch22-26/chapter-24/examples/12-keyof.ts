interface Tour {
  title: string;
  price: number;
  days: number;
}

function sortBy<T>(items: readonly T[], key: keyof T): T[] {
  const compare = (a: T, b: T) =>
    (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0);
  return [...items].sort(compare);
}

function update<T>(item: T, changes: Partial<T>): T {
  return { ...item, ...changes };
}

const tours: Tour[] = [
  { title: 'Sajek', price: 6_500, days: 2 },
  { title: 'Kuakata', price: 4_000, days: 2 },
];
console.log(sortBy(tours, 'price').map((t) => t.title));
console.log(update(tours[0]!, { price: 7_000 }));
sortBy(tours, 'prize');
