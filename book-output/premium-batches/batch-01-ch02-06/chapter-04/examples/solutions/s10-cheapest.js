function cheapestName(items) {
  if (items.length === 0) {
    return null;
  }

  let cheapest = items[0];

  for (let i = 1; i < items.length; i++) {
    if (items[i].price < cheapest.price) {
      cheapest = items[i];
    }
  }

  return cheapest.name;
}

const items = [
  { name: 'Notebook', price: 120 },
  { name: 'Pen', price: 15 },
  { name: 'Bag', price: 950 },
];

console.log(cheapestName(items));
console.log(cheapestName([]));
