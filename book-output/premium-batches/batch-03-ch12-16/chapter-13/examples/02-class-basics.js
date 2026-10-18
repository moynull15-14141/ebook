class Product {
  discount = 0;

  constructor(name, price) {
    this.name = name;
    this.price = price;
  }

  finalPrice() {
    return this.price * (1 - this.discount / 100);
  }

  label() {
    return `${this.name}: ${this.finalPrice()} টাকা`;
  }
}

const pen = new Product('Pen', 50);
pen.discount = 10;

console.log(pen.label());
console.log(Object.keys(pen).join(', '));
console.log(typeof Product);
