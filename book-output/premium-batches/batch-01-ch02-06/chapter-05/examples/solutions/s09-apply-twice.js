function applyTwice(value, operation) {
  return operation(operation(value));
}

const addTen = (number) => number + 10;
const double = (number) => number * 2;

console.log(applyTwice(5, addTen));
console.log(applyTwice(5, double));
