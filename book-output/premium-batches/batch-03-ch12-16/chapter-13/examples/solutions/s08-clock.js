class Clock {
  ticks = 0;

  tick() {
    this.ticks += 1;
    console.log(`টিক ${this.ticks}`);
  }

  start() {
    setTimeout(() => this.tick(), 10);
  }
}

new Clock().start();
