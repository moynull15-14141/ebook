function deliveryFee(amount) {
  if (amount >= 3000) {
    return 0;
  } else if (amount >= 1500) {
    return 60;
  } else {
    return 120;
  }
}

console.log(deliveryFee(3000));
console.log(deliveryFee(2999));
console.log(deliveryFee(1500));
console.log(deliveryFee(1499));
