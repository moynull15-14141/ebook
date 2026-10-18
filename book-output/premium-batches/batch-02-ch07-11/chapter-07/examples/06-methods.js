const account = {
  owner: 'Sara',
  balance: 1000,

  deposit(amount) {
    this.balance += amount;
    return this.balance;
  },

  describe() {
    return `${this.owner}: ${this.balance} টাকা`;
  },
};

console.log(account.deposit(500));
console.log(account.describe());
