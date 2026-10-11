const MAX_DISCOUNT = 1000;

function cappedDiscount(subtotal, percent) {
  const discount = Math.round(subtotal * percent / 100);

  return discount > MAX_DISCOUNT ? MAX_DISCOUNT : discount;
}

console.log(cappedDiscount(3000, 10));
console.log(cappedDiscount(20000, 10));
