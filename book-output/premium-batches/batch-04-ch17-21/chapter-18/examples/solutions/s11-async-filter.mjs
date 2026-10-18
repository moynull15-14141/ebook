const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isAvailable = async (sku) => {
  await wait(10);
  return sku !== 'B2';
};

async function asyncFilter(items, predicate) {
  const keep = await Promise.all(items.map(predicate));
  return items.filter((_, index) => keep[index]);
}

const wrong = ['B1', 'B2', 'B3'].filter(isAvailable);
console.log(wrong.length);
console.log((await asyncFilter(['B1', 'B2', 'B3'], isAvailable)).join(','));
