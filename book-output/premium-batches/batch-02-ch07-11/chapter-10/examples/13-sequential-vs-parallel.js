const wait = (ms, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));
const rounded = (start) => Math.round((Date.now() - start) / 100) * 100;

async function main() {
  let start = Date.now();
  const a = await wait(200, 'User');
  const b = await wait(200, 'Order');
  console.log(`একটির পর একটি: ${a}, ${b}; প্রায় ${rounded(start)} ms`);

  start = Date.now();
  const [c, d] = await Promise.all([wait(200, 'User'), wait(200, 'Order')]);
  console.log(`একসঙ্গে: ${c}, ${d}; প্রায় ${rounded(start)} ms`);
}

main();
