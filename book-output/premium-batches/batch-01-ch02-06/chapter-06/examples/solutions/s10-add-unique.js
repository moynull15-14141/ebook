function addUnique(products, product) {
  const existing = products.find((item) => item.id === product.id);

  if (existing !== undefined) {
    return products;
  }

  return [...products, product];
}

const products = [{ id: 'P1', name: 'Notebook' }];
const added = addUnique(products, { id: 'P2', name: 'Pen' });
const duplicate = addUnique(added, { id: 'P2', name: 'Pencil' });

console.log(added.length);
console.log(duplicate.length);
console.log(duplicate === added);
