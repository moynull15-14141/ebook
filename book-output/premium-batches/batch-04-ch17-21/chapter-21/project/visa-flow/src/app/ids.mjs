// ক্রমিক ID: VF-001, VF-002, ... (Test-এ নিশ্চিত ফলের জন্য Inject করা হয়)।
export function createSequence(prefix, start = 1) {
  let next = start;
  return () => `${prefix}-${String(next++).padStart(3, '0')}`;
}

// সংরক্ষিত ID-গুলোর সবচেয়ে বড় সংখ্যার পর থেকে। সংখ্যা গুনে শুরু করলে
// মাঝে ফাঁক থাকলে একটি পুরোনো ID আবার আসত, এবং আগের আবেদন মুছে যেত।
export function sequenceAfter(prefix, ids) {
  const numbers = ids.map((id) => Number(id.slice(prefix.length + 1)))
    .filter(Number.isInteger);
  return createSequence(prefix, Math.max(0, ...numbers) + 1);
}
