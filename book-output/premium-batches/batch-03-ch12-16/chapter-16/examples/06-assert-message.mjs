import assert from 'node:assert/strict';

const priceFor = (seats) => seats * 350;

try {
  assert.equal(priceFor(5), 1575, 'পাঁচ আসনে গ্রুপ ছাড় প্রত্যাশিত');
} catch (error) {
  console.log(error.code, error.actual, error.expected);
  console.log(error.message);
}
