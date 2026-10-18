// খসড়া নিয়ম: ১,০০০ টাকার নিচে ২% (ন্যূনতম ৫০), তারপর ১.৫% (ন্যূনতম ১৫)।
function draftFee(minor) {
  if (minor < 100_000) {
    return Math.max(5_000, Math.round(minor * 0.02));
  }
  return Math.max(1_500, Math.round(minor * 0.015));
}

for (const minor of [99_999, 100_000, 100_001]) {
  const taka = (n) => (n / 100).toFixed(2);
  console.log(`${taka(minor)} পাঠালে Fee ${taka(draftFee(minor))}`);
}
