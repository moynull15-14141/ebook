const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryServerErrors(task, retries = 2) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      if (!(error.status >= 500) || attempt >= retries) {
        throw error;
      }
      await wait(100 * 2 ** attempt);
    }
  }
}

function serverReplying(...statuses) {
  let call = 0;
  return async () => {
    const status = statuses[call];
    call += 1;
    if (status === 200) {
      return `সফল (${call} বারের চেষ্টায়)`;
    }
    const error = new Error(`HTTP ${status}`);
    error.status = status;
    throw error;
  };
}

async function main() {
  console.log(await retryServerErrors(serverReplying(503, 500, 200)));

  try {
    await retryServerErrors(serverReplying(404, 200));
  } catch (error) {
    console.log(`আবার চেষ্টা হয়নি: ${error.message}`);
  }
}

main();
