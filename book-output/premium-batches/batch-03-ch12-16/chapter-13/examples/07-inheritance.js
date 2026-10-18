class Vehicle {
  constructor(name, wheels) {
    this.name = name;
    this.wheels = wheels;
  }

  describe() {
    return `${this.name}: ${this.wheels} চাকা`;
  }

  fare(km) {
    return km * 10;
  }
}

class Rickshaw extends Vehicle {
  constructor(name) {
    super(name, 3);
  }

  fare(km) {
    return Math.max(30, super.fare(km) * 2);
  }
}

class Bus extends Vehicle {
  constructor(name, seats) {
    super(name, 6);
    this.seats = seats;
  }

  describe() {
    return `${super.describe()}, ${this.seats} আসন`;
  }
}

const rickshaw = new Rickshaw('রিকশা');
const bus = new Bus('বাস', 40);

console.log(rickshaw.describe());
console.log(rickshaw.fare(1), rickshaw.fare(5));
console.log(bus.describe(), bus.fare(5));
console.log(bus instanceof Bus, bus instanceof Vehicle, bus instanceof Rickshaw);
