class Product {
  constructor(name) {
    this.name = name;
  }

  label() {
    return `পণ্য: ${this.name}`;
  }
}

const pen = new Product('Pen');

console.log(Object.getPrototypeOf(pen) === Product.prototype);
console.log(Object.hasOwn(pen, 'name'), Object.hasOwn(pen, 'label'));
console.log('label' in pen);
console.log(Object.getPrototypeOf(Product.prototype) === Object.prototype);
console.log(typeof pen.toString);

Product.prototype.shout = function () {
  return this.label().toUpperCase();
};
console.log(pen.shout());
