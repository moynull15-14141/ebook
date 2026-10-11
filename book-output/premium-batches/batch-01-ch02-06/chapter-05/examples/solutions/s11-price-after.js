const noDiscount = (amount) => 0;
const fifteenPercent = (amount) => Math.round(amount * 15 / 100);
const flat2000 = (amount) => 2000;

function priceAfter(amount, discountRule) {
  return amount - discountRule(amount);
}

console.log(priceAfter(50000, noDiscount));
console.log(priceAfter(50000, fifteenPercent));
console.log(priceAfter(50000, flat2000));
