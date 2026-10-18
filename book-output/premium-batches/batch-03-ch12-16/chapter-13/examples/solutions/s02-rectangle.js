class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  get area() {
    return this.width * this.height;
  }

  get perimeter() {
    return 2 * (this.width + this.height);
  }
}

const room = new Rectangle(4, 3);
console.log(room.area, room.perimeter);
room.width = 5;
console.log(room.area);
