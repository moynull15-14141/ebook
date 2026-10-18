class Shape {
  area() {
    throw new Error(`${this.constructor.name} area() লেখেনি`);
  }
}

class Square extends Shape {
  constructor(side) {
    super();
    this.side = side;
  }

  area() {
    return this.side ** 2;
  }
}

class Triangle extends Shape {}

console.log(new Square(3).area());

try {
  new Triangle().area();
} catch (error) {
  console.log(error.message);
}
