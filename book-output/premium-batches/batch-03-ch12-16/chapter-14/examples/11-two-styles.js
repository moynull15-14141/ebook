class Cart {
  #items = [];

  add(name, price) {
    this.#items.push({ name, price });
    return this;
  }

  get total() {
    return this.#items.reduce((sum, item) => sum + item.price, 0);
  }
}

const addItem = (items, name, price) => [...items, { name, price }];
const totalOf = (items) => items.reduce((sum, item) => sum + item.price, 0);

const cart = new Cart().add('Pen', 50).add('Notebook', 120);
const before = addItem([], 'Pen', 50);
const after = addItem(before, 'Notebook', 120);

console.log(cart.total, totalOf(after), totalOf(before));
