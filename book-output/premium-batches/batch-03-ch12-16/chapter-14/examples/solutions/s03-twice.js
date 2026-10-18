const twice = (fn) => (value) => fn(fn(value));

const double = (n) => n * 2;
const exclaim = (text) => `${text}!`;

console.log(twice(double)(3));
console.log(twice(exclaim)('বাহ'));
