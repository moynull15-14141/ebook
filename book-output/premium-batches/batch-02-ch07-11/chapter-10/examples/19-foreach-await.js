const wait = (ms, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

async function withForEach(ids) {
  const names = [];
  ids.forEach(async (id) => {
    names.push(await wait(50, `User ${id}`));
  });
  return names.length;
}

async function withForOf(ids) {
  const names = [];
  for (const id of ids) {
    names.push(await wait(50, `User ${id}`));
  }
  return names.length;
}

withForEach([1, 2, 3]).then((count) => console.log(`forEach: ${count}টি`));
withForOf([1, 2, 3]).then((count) => console.log(`for...of: ${count}টি`));
