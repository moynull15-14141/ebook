class BankAccount {
  #balance = 0;

  deposit(amount) {
    this.#validate(amount);
    this.#balance += amount;
  }

  withdraw(amount) {
    this.#validate(amount);
    if (amount > this.#balance) {
      throw new RangeError('যথেষ্ট টাকা নেই');
    }
    this.#balance -= amount;
  }

  get balance() {
    return this.#balance;
  }

  #validate(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new RangeError('পরিমাণ ধনাত্মক হতে হবে');
    }
  }
}

const account = new BankAccount();
account.deposit(500);
account.withdraw(200);
console.log(account.balance, Object.keys(account).length);

try {
  account.withdraw(1000);
} catch (error) {
  console.log(error.message);
}
console.log(account.balance);
