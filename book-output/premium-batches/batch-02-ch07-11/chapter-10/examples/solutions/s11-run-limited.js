const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runLimited(tasks, limit) {
  const results = [];
  let next = 0;

  async function worker() {
    while (next < tasks.length) {
      const index = next;
      next += 1;
      results[index] = await tasks[index]();
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

let running = 0;
const job = (name, ms) => async () => {
  running += 1;
  console.log(`শুরু ${name} (একসঙ্গে ${running})`);
  await wait(ms);
  running -= 1;
  return name;
};

const jobs = [job('ক', 120), job('খ', 50), job('গ', 50), job('ঘ', 50)];
runLimited(jobs, 2).then((names) => console.log(`শেষ: ${names.join(', ')}`));
