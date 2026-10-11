const scores = [40, 100, 9];

console.log([...scores].sort());
console.log([...scores].sort((a, b) => a - b));
console.log(scores);
