import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

function register(user, logger) {
  logger('info', 'user-registered', { email: user.email });
  return { ...user, active: true };
}

test('নিবন্ধনে ঠিক একটি info Log, Password ছাড়া', () => {
  const logger = mock.fn();
  register({ email: 'a@b.co', password: 'secret' }, logger);

  assert.equal(logger.mock.callCount(), 1);
  const expected = ['info', 'user-registered', { email: 'a@b.co' }];
  assert.deepEqual(logger.mock.calls[0].arguments, expected);
  assert.doesNotMatch(JSON.stringify(logger.mock.calls), /secret/);
});
