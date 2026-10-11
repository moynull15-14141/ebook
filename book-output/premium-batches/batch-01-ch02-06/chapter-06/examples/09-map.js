const prices = [120, 15, 950];

const withTax = prices.map((price) => price + Math.round(price * 15 / 100));
const labels = prices.map((price) => `${price} টাকা`);

console.log(withTax);
console.log(labels);
console.log(prices);
