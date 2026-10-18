const samples = [12, 13, 12, 80, 12];
const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
const median = samples.toSorted((a, b) => a - b)[Math.floor(samples.length / 2)];

console.log(mean, median);
