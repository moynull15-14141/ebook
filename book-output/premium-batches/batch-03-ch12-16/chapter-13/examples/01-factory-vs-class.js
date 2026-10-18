function createAccount(owner, balance) {
  return {
    owner,
    balance,
    deposit(amount) {
      this.balance += amount;
    },
  };
}

class Account {
  constructor(owner, balance) {
    this.owner = owner;
    this.balance = balance;
  }

  deposit(amount) {
    this.balance += amount;
  }
}

const first = createAccount('Sara', 100);
const second = new Account('Rafi', 100);
first.deposit(50);
second.deposit(50);

console.log(first.balance, second.balance);
console.log(second instanceof Account, first instanceof Account);

const third = createAccount('Mina', 0);
const fourth = new Account('Nila', 0);
console.log(first.deposit === third.deposit, second.deposit === fourth.deposit);
