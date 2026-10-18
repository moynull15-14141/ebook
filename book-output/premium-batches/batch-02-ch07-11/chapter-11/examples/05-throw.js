function readPrice(item) {
  if (typeof item?.price !== 'number') {
    throw new TypeError('পণ্যের দাম একটি সংখ্যা হতে হবে');
  }
  if (item.price < 0) {
    throw new RangeError(`দাম ঋণাত্মক হতে পারে না: ${item.price}`);
  }
  return item.price;
}

for (const item of [{ price: 250 }, { price: '250' }, { price: -5 }]) {
  try {
    console.log(`দাম: ${readPrice(item)}`);
  } catch (error) {
    console.log(`${error.name}: ${error.message}`);
  }
}
