import test from 'node:test';
import assert from 'node:assert/strict';

function draftFee(minor) {
  if (minor < 100_000) {
    return Math.max(5_000, Math.round(minor * 0.02));
  }
  return Math.max(1_500, Math.round(minor * 0.015));
}

test('বেশি পাঠালে Fee কখনো কমে না', () => {
  let previous = 0;
  for (let minor = 1; minor <= 5_000_000; minor += 997) {
    const fee = draftFee(minor);
    assert.ok(fee >= previous, `${minor} পয়সায় Fee ${fee}, আগে ছিল ${previous}`);
    previous = fee;
  }
});
