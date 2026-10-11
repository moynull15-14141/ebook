const prices = [120, 15, 950, 280];

const sum = prices.reduce((total, price) => total + price, 0);

console.log(sum);
console.log(sum / prices.length);
