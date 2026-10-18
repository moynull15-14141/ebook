const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let active = 0;
let peak = 0;

async function loadFile(name) {
  active += 1;
  peak = Math.max(peak, active);
  await wait(30);
  active -= 1;
  return `${name}: ১০০ সারি`;
}

const files = ['jan', 'feb', 'mar', 'apr', 'may'];

const sequential = [];
for (const file of files) {
  sequential.push(await loadFile(file));
}
console.log(`ক্রমে: সর্বোচ্চ একসঙ্গে ${peak}`);

peak = 0;
const all = await Promise.all(files.map(loadFile));
console.log(`একসঙ্গে: সর্বোচ্চ একসঙ্গে ${peak}, ফল ${all.length}`);

peak = 0;
const batched = [];
for (let i = 0; i < files.length; i += 2) {
  const batch = files.slice(i, i + 2);
  batched.push(...(await Promise.all(batch.map(loadFile))));
}
console.log(`দলে দলে: সর্বোচ্চ একসঙ্গে ${peak}, ফল ${batched.length}`);
console.log(batched[4]);
