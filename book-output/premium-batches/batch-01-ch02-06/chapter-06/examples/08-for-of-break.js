const prices = [120, 15, 950, 280];
let firstExpensive = null;

for (const price of prices) {
  if (price > 500) {
    firstExpensive = price;
    break;
  }
}

console.log(firstExpensive);
