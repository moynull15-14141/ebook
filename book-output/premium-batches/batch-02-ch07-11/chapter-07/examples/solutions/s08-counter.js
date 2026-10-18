const counter = {
  count: 0,

  increment() {
    this.count++;
    return this.count;
  },

  reset() {
    this.count = 0;
  },
};

counter.increment();
console.log(counter.increment());
counter.reset();
console.log(counter.count);
