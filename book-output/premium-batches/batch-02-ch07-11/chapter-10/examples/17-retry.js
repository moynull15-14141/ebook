const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let calls = 0;
async function flakyServer() {
  calls += 1;
  if (calls < 3) {
    throw new Error(`চেষ্টা ${calls}: Server ব্যস্ত`);
  }
  return 'তথ্য পাওয়া গেছে';
}

async function withRetry(task, retries = 3, baseDelay = 100) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }
      const delay = baseDelay * 2 ** attempt;
      console.log(`${error.message}; ${delay} ms পরে আবার`);
      await wait(delay);
    }
  }
}

withRetry(flakyServer).then((data) => console.log(data));
