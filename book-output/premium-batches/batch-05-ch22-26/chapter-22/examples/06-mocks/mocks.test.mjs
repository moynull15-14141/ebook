import test from 'node:test';
import assert from 'node:assert/strict';

const notifier = { send: (to, text) => `SMS ${to}: ${text}` };

function remindLater(phone, delayMs) {
  const text = 'আপনার Quote-এর মেয়াদ শেষ হচ্ছে';
  setTimeout(() => notifier.send(phone, text), delayMs);
}

test('৬০ সেকেন্ড পরে ঠিক একটি SMS', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const send = t.mock.method(notifier, 'send', () => 'sent');

  remindLater('01712345678', 60_000);
  t.mock.timers.tick(59_999);
  assert.equal(send.mock.callCount(), 0);

  t.mock.timers.tick(1);
  assert.equal(send.mock.callCount(), 1);
  assert.deepEqual(send.mock.calls[0].arguments,
    ['01712345678', 'আপনার Quote-এর মেয়াদ শেষ হচ্ছে']);
});

test('Test শেষে আসল Method ফিরে আসে', () => {
  assert.equal(notifier.send('x', 'y'), 'SMS x: y');
});
