class Wallet {
  #balance;

  constructor(balance) {
    this.#balance = balance;
  }

  spend(amount) {
    if (amount > this.#balance) {
      throw new RangeError(`${amount} টাকা খরচ সম্ভব নয়; আছে ${this.#balance}`);
    }
    this.#balance -= amount;
    return this.#balance;
  }
}

const wallet = new Wallet(300);
console.log(wallet.spend(120));

try {
  wallet.spend(500);
} catch (error) {
  console.log(error.message);
}
