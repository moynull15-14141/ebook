function finalPrice(amount, discountPercent = 0) {
  return amount - Math.round(amount * discountPercent / 100);
}

console.log(finalPrice(500));
console.log(finalPrice(500, 10));
