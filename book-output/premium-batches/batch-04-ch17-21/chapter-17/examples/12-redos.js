const evil = /^(a+)+$/;
const safe = /^a+$/;

function timeMs(regex, input) {
  const start = performance.now();
  regex.test(input);
  return performance.now() - start;
}

timeMs(evil, 'aaab');
timeMs(safe, 'aaab');

for (const n of [16, 18, 20, 22, 24]) {
  const ms = timeMs(evil, `${'a'.repeat(n)}b`);
  console.log(`/^(a+)+$/  ${n} অক্ষর: ${ms.toFixed(2)} ms`);
}
const safeMs = timeMs(safe, `${'a'.repeat(24)}b`);
console.log(`/^a+$/     24 অক্ষর: ${safeMs.toFixed(2)} ms`);
