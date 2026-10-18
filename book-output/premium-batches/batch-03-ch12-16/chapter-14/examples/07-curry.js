function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...more) => curried(...args, ...more);
  };
}

const priceWithVat = curry((ratePercent, price) =>
  Math.round((price * (100 + ratePercent)) / 100));

const bdVat = priceWithVat(15);
console.log(bdVat(1000), bdVat(200));
console.log(priceWithVat(5, 1000));

const isAbove = curry((limit, value) => value > limit);
console.log([120, 2500, 950, 4000].filter(isAbove(1000)).join(', '));

const discount = (percent, price) => price * (1 - percent / 100);
const tenPercentOff = discount.bind(null, 10);
console.log(tenPercentOff(500));
