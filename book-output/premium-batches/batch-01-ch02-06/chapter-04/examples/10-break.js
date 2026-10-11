const prices = [120, 15, 950, 280, 1500];
let checked = 0;

for (let i = 0; i < prices.length; i++) {
  checked++;

  if (prices[i] > 500) {
    console.log(`প্রথম দামি পণ্য: ${prices[i]} (Index ${i})`);
    break;
  }
}

console.log(`যাচাই করা হয়েছে ${checked}টি`);
