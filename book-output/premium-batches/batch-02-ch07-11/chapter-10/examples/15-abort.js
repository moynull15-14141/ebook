function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(`${ms} ms পরে শেষ`), ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

const controller = new AbortController();

wait(500, controller.signal)
  .then((text) => console.log(text))
  .catch((error) => console.log(`বাতিল: ${error.name}`));

setTimeout(() => controller.abort(), 100);

wait(500, AbortSignal.timeout(150))
  .then((text) => console.log(text))
  .catch((error) => console.log(`সময় শেষ: ${error.name}`));
