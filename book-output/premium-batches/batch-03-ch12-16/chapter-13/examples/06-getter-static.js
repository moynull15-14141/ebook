class Temperature {
  static ABSOLUTE_ZERO = -273.15;

  #celsius = 0;

  constructor(celsius) {
    this.celsius = celsius;
  }

  get celsius() {
    return this.#celsius;
  }

  set celsius(value) {
    if (value < Temperature.ABSOLUTE_ZERO) {
      throw new RangeError(`${value} ডিগ্রি সম্ভব নয়`);
    }
    this.#celsius = value;
  }

  get fahrenheit() {
    return (this.#celsius * 9) / 5 + 32;
  }

  static fromFahrenheit(fahrenheit) {
    return new Temperature(((fahrenheit - 32) * 5) / 9);
  }
}

const today = new Temperature(30);
console.log(today.fahrenheit);
today.celsius = 35;
console.log(today.celsius, today.fahrenheit);

const boiling = Temperature.fromFahrenheit(212);
console.log(boiling.celsius);

try {
  today.celsius = -300;
} catch (error) {
  console.log(error.message);
}
console.log(typeof today.fromFahrenheit);
