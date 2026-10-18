function discount(price: number, percent: number): number {
  return Math.round(price * (1 - percent / 100));
}

console.log(discount(500, 10));
console.log(discount('500', 10));
