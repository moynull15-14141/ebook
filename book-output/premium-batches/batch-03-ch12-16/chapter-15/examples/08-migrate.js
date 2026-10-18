function migrate(data) {
  if (data?.version === 1) {
    const items = data.items.map((name) => ({ name, done: false }));
    return { version: 2, items };
  }
  if (data?.version === 2) {
    return data;
  }
  throw new Error(`অচেনা Version: ${data?.version}`);
}

const saved = { version: 1, items: ['বাজার', 'বই পড়া'] };
const current = migrate(saved);

console.log(current.version, current.items[0].name, current.items[0].done);
console.log(migrate(current) === current);

try {
  migrate({ version: 9 });
} catch (error) {
  console.log(error.message);
}
