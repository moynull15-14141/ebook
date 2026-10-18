async function retryIfAllowed(task, times = 3) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await task(attempt);
    } catch (error) {
      if (error.retryable !== true || attempt >= times) {
        throw error;
      }
      console.log(`চেষ্টা ${attempt} ব্যর্থ, আবার`);
    }
  }
}

const busyTwice = async (attempt) => {
  if (attempt < 3) {
    throw Object.assign(new Error('ব্যস্ত'), { retryable: true });
  }
  return 'সফল';
};

const forbidden = async () => {
  throw Object.assign(new Error('অনুমতি নেই'), { retryable: false });
};

async function main() {
  console.log(await retryIfAllowed(busyTwice));
  await retryIfAllowed(forbidden).catch((error) => console.log(error.message));
}

main();
