const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));

// items-কে size-এর টুকরোয় process করে; প্রতিটি টুকরোর পর yieldFn।
export async function processInChunks(items, fn, options = {}) {
  const { size = 1000, yieldFn = nextTask } = options;
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError('size একটি ধনাত্মক পূর্ণসংখ্যা হতে হবে');
  }
  const results = [];
  for (let i = 0; i < items.length; i += size) {
    for (const item of items.slice(i, i + size)) {
      results.push(fn(item));
    }
    if (i + size < items.length) {
      await yieldFn();
    }
  }
  return results;
}
