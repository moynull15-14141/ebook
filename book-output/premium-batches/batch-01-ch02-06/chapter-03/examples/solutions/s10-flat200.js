function flat200Discount(subtotal) {
  return subtotal >= 1000 ? 200 : 0;
}

console.log(flat200Discount(999));
console.log(flat200Discount(1000));
