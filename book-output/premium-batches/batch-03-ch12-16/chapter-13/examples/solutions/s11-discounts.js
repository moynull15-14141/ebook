class NoDiscount {
  apply(amount) {
    return amount;
  }
}

class PercentDiscount {
  constructor(percent) {
    this.percent = percent;
  }

  apply(amount) {
    return Math.round(amount * (1 - this.percent / 100));
  }
}

class FlatDiscount {
  constructor(off) {
    this.off = off;
  }

  apply(amount) {
    return Math.max(0, amount - this.off);
  }
}

class PriceCalculator {
  #discount;

  constructor(discount = new NoDiscount()) {
    this.#discount = discount;
  }

  final(amount) {
    return this.#discount.apply(amount);
  }
}

const rules = [new NoDiscount(), new PercentDiscount(10), new FlatDiscount(200)];

for (const rule of rules) {
  const price = new PriceCalculator(rule).final(1500);
  console.log(`${rule.constructor.name}: ${price}`);
}
