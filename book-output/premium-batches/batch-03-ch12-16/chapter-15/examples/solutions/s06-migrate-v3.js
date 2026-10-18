function migrate(data) {
  let current = data;
  if (current?.version === 1) {
    const items = current.items.map((name) => ({ name, done: false }));
    current = { version: 2, items };
  }
  if (current?.version === 2) {
    const items = current.items.map((item) => ({ ...item, createdAt: null }));
    current = { version: 3, items };
  }
  if (current?.version !== 3) {
    throw new Error(`অচেনা Version: ${data?.version}`);
  }
  return current;
}

const fromV1 = migrate({ version: 1, items: ['বাজার'] });
console.log(fromV1.version, JSON.stringify(fromV1.items[0]));
