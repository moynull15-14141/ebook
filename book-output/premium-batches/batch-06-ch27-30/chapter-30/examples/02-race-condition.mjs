import { DatabaseSync } from 'node:sqlite';

// দুটি অনুরোধ একসঙ্গে শেষ ২টি আসনের ২টি করে চায়।
// ভুল পথ: পড়া, তারপর (await-এর ফাঁকে) লেখা।
const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE packages (id TEXT PRIMARY KEY, seats INTEGER);
  INSERT INTO packages VALUES ('SYL-2D', 2);`);
const reset = () => db.exec("UPDATE packages SET seats = 2");
const seats = () => db.prepare('SELECT seats FROM packages').get().seats;
const pause = () => new Promise((resolve) => setTimeout(resolve, 10));

async function checkThenAct(want) {
  const available = seats();
  await pause(); // যেমন Payment Gateway-কে জিজ্ঞাসা, বা অন্য কোনো await
  if (available < want) return 'SOLD_OUT';
  db.prepare('UPDATE packages SET seats = ? WHERE id = ?')
    .run(available - want, 'SYL-2D');
  return 'BOOKED';
}

async function conditionalUpdate(want) {
  await pause();
  // যাচাই ও কমানো একটি Statement-এ: মাঝখানে কেউ ঢুকতে পারে না।
  const { changes } = db.prepare(`UPDATE packages SET seats = seats - ?
    WHERE id = ? AND seats >= ?`).run(want, 'SYL-2D', want);
  return changes ? 'BOOKED' : 'SOLD_OUT';
}

for (const strategy of [checkThenAct, conditionalUpdate]) {
  reset();
  const results = await Promise.all([strategy(2), strategy(2)]);
  console.log(`${strategy.name}: ${results.join(', ')}; বাকি আসন ${seats()}`);
}
