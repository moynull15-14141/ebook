let runningTotal = 0;

function addToTotal(amount) {
  runningTotal += amount;
  return runningTotal;
}

function add(a, b) {
  return a + b;
}

console.log(addToTotal(100));
console.log(addToTotal(100));
console.log(add(100, 100));
console.log(add(100, 100));
