const pipe = (...fns) => (input) => fns.reduce((value, fn) => fn(value), input);
const compose = (...fns) => pipe(...fns.toReversed());

const add10 = (n) => n + 10;
const double = (n) => n * 2;
const square = (n) => n * n;

console.log(pipe(add10, double, square)(1));
console.log(compose(add10, double, square)(1));
