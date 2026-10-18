// পণ্যের তালিকা; দাম পূর্ণ টাকায়।
export const PRODUCTS = Object.freeze([
  Object.freeze({ id: 'notebook', name: 'Notebook', price: 120 }),
  Object.freeze({ id: 'pen-set', name: 'Pen Set', price: 250 }),
  Object.freeze({ id: 'calculator', name: 'Calculator', price: 950 }),
  Object.freeze({ id: 'backpack', name: 'Backpack', price: 1850 }),
]);

export function findProduct(id) {
  return PRODUCTS.find((product) => product.id === id) ?? null;
}
