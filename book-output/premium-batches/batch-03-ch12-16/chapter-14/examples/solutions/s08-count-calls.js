function memoize(fn) {
  const cache = new Map();
  return (key) => {
    if (!cache.has(key)) {
      cache.set(key, fn(key));
    }
    return cache.get(key);
  };
}

let realCalls = 0;
const shippingCost = memoize((city) => {
  realCalls += 1;
  return city === 'Dhaka' ? 60 : 120;
});

const orders = ['Dhaka', 'Bogura', 'Dhaka', 'Dhaka', 'Bogura'];
console.log(orders.map(shippingCost).join(', '));
console.log(`আসল হিসাব: ${realCalls} বার`);
