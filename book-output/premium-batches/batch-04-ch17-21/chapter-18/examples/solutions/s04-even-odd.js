const groups = Map.groupBy([1, 2, 3, 4, 5], (n) => n % 2 === 0);

console.log(groups.get(true), groups.get(false), [...groups.keys()]);
