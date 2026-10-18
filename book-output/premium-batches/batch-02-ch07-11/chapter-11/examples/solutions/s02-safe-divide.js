function safeDivide(a, b) {
  if (b === 0) {
    throw new RangeError('শূন্য দিয়ে ভাগ করা যায় না');
  }
  return a / b;
}

for (const [a, b] of [[10, 4], [10, 0]]) {
  try {
    console.log(safeDivide(a, b));
  } catch (error) {
    console.log(`${error.name}: ${error.message}`);
  }
}
