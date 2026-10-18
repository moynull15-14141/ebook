class Payment {
  constructor(amount) {
    this.amount = amount;
  }

  fee() {
    return 0;
  }

  total() {
    return this.amount + this.fee();
  }

  label() {
    return `${this.constructor.name}: ${this.total()} টাকা`;
  }
}

class CardPayment extends Payment {
  fee() {
    return Math.round(this.amount * 0.02);
  }
}

class MobilePayment extends Payment {
  fee() {
    return Math.min(25, Math.round(this.amount * 0.015));
  }
}

const payments = [
  new Payment(500),
  new CardPayment(1000),
  new MobilePayment(3000),
];

for (const payment of payments) {
  console.log(payment.label());
}
console.log(`মোট Fee: ${payments.reduce((sum, payment) => sum + payment.fee(), 0)}`);
