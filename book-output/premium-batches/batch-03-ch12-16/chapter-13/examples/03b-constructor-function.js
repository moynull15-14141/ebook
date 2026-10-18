function Product(name) {
  this.name = name;
}

Product.prototype.label = function () {
  return `পণ্য: ${this.name}`;
};

const pen = new Product('Pen');
console.log(pen.label(), pen instanceof Product);

const base = { greet() { return `হ্যালো, ${this.name}`; } };
const user = Object.create(base);
user.name = 'Sara';
console.log(user.greet(), Object.getPrototypeOf(user) === base);
