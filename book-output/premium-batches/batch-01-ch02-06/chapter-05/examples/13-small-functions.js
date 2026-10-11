function percentOf(amount, percent) {
  return Math.round(amount * percent / 100);
}

function applyDiscount(amount, percent) {
  return amount - percentOf(amount, percent);
}

function addTax(amount, percent) {
  return amount + percentOf(amount, percent);
}

const discounted = applyDiscount(1000, 10);
const payable = addTax(discounted, 5);

console.log(discounted);
console.log(payable);
