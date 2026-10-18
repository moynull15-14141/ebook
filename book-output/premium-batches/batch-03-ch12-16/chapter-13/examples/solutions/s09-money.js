class Money {
  constructor(amount) {
    if (!Number.isInteger(amount) || amount < 0) {
      throw new RangeError(`অবৈধ অঙ্ক: ${amount}`);
    }
    this.amount = amount;
  }

  static fromText(text) {
    const digits = text.replace(/[^\d]/g, '');
    return new Money(Number(digits));
  }

  toString() {
    return `${this.amount.toLocaleString('en-US')} টাকা`;
  }
}

const price = Money.fromText('1,250 টাকা');
console.log(price.amount, `${price}`);
