function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

const tours = [{ title: 'Sajek', days: 2 }, { title: 'Ratargul', days: 1 }];
const titles: string[] = pluck(tours, 'title');
const days: number[] = pluck(tours, 'days');
console.log(titles, days);
