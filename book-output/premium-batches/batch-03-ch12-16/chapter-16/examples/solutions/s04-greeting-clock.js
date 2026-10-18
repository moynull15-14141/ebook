function greeting(now = new Date()) {
  return now.getHours() < 12 ? 'শুভ সকাল' : 'শুভ অপরাহ্ন';
}

console.log(greeting(new Date(2026, 0, 1, 9, 0)));
console.log(greeting(new Date(2026, 0, 1, 15, 0)));
