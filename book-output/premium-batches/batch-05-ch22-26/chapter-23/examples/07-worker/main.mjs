const url = new URL('./worker.mjs', import.meta.url);
const worker = new Worker(url, { type: 'module' });

worker.addEventListener('message', ({ data }) => {
  console.log(`Worker-এর যোগফল: ${data}`);
  worker.terminate();
});

worker.postMessage(10_000_000);
console.log('postMessage সঙ্গে সঙ্গে ফিরেছে; Main Thread মুক্ত');
