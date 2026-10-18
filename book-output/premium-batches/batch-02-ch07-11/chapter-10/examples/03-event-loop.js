console.log('A: শুরু');

setTimeout(() => console.log('F: setTimeout'), 0);

Promise.resolve().then(() => console.log('D: Promise'));

async function task() {
  console.log('B: async Function, await-এর আগে');
  await null;
  console.log('E: await-এর পরে');
}

task();
console.log('C: শেষ লাইন');
