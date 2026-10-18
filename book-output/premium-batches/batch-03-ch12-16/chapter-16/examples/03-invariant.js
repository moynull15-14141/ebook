function invariant(condition, message) {
  if (!condition) {
    throw new Error(`Invariant ভঙ্গ: ${message}`);
  }
}

function transfer(accounts, from, to, amount) {
  invariant(Number.isInteger(amount) && amount > 0, 'পরিমাণ ধনাত্মক পূর্ণসংখ্যা');
  const totalBefore = accounts[from] + accounts[to];
  const next = {
    ...accounts,
    [from]: accounts[from] - amount,
    [to]: accounts[to] + amount,
  };

  invariant(next[from] >= 0, `${from}-এর Balance ঋণাত্মক হবে`);
  invariant(next[from] + next[to] === totalBefore, 'মোট টাকা অপরিবর্তিত');
  return next;
}

console.log(JSON.stringify(transfer({ a: 100, b: 50 }, 'a', 'b', 30)));

try {
  transfer({ a: 100, b: 50 }, 'a', 'b', 500);
} catch (error) {
  console.log(error.message);
}
