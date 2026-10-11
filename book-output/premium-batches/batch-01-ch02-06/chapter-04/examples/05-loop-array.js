const prices = [120, 15, 950];
let total = 0;

for (let i = 0; i < prices.length; i++) {
  console.log(`Index ${i}: ${prices[i]}`);
  total += prices[i];
}

console.log(`মোট: ${total}`);
