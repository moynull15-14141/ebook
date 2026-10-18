const wait = (ms, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${ms} ms পার হয়েছে`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function main() {
  console.log(await withTimeout(wait(50, 'সময়মতো এসেছে'), 200));

  try {
    await withTimeout(wait(500, 'দেরিতে'), 200);
  } catch (error) {
    console.log(error.message);
  }
}

main();
