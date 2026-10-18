class Vehicle {
  constructor(name) {
    this.name = name;
  }
}

class Truck extends Vehicle {
  constructor(name, load) {
    this.load = load;
    super(name);
  }
}

new Truck('Truck', 5);
