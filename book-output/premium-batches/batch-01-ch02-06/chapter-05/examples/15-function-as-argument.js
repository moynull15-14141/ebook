const tenPercent = (amount) => Math.round(amount * 10 / 100);
const flatFifty = (amount) => 50;

function finalPrice(amount, discountRule) {
  return amount - discountRule(amount);
}

console.log(finalPrice(1000, tenPercent));
console.log(finalPrice(1000, flatFifty));
