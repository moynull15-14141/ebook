class Counter {
  count = 0;

  increment() {
    this.count += 1;
    return this.count;
  }

  incrementArrow = () => {
    this.count += 1;
    return this.count;
  };
}

const counter = new Counter();
const loose = counter.increment;

try {
  loose();
} catch (error) {
  console.log(error.name);
}

const bound = counter.increment.bind(counter);
console.log(bound());

const arrow = counter.incrementArrow;
console.log(arrow());

console.log([1, 2].map(() => counter.increment()).join(', '));
