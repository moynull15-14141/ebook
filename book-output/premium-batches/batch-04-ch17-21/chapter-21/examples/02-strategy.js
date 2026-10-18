const discountStrategies = {
  none: () => 0,
  earlyBird: ({ daysAhead, price }) => (daysAhead >= 60 ? price * 0.1 : 0),
  group: ({ travelers, price }) => (travelers >= 5 ? price * 0.15 : 0),
};

function finalPrice(order, strategyName) {
  const strategy = discountStrategies[strategyName] ?? discountStrategies.none;
  return order.price - Math.round(strategy(order));
}

const order = { price: 40000, travelers: 5, daysAhead: 75 };
for (const name of ['none', 'earlyBird', 'group', 'unknown']) {
  console.log(name.padEnd(10), finalPrice(order, name));
}

// নতুন নিয়ম: পুরোনো কোনো লাইন না বদলে যোগ।
discountStrategies.student = ({ price }) => price * 0.2;
console.log('student'.padEnd(10), finalPrice(order, 'student'));
