const curry = (fn) => function curried(...args) {
  if (args.length >= fn.length) {
    return fn(...args);
  }
  return (...more) => curried(...args, ...more);
};

const between = curry((min, max, value) => value >= min && value <= max);
const isPassMark = between(33, 100);

console.log([12, 45, 88, 101, 33].filter(isPassMark).join(', '));
console.log(between(1)(10)(5), between(1, 10)(50));
