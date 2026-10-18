import test from 'node:test';
import assert from 'node:assert/strict';
import { domain, PASSWORD } from './helpers.mjs';

test('Password সাধারণ লেখায় নয়; Token-ও Database-এ শুধু Hash', () => {
  const { db, user } = domain();
  const { token } = user('Rafi');
  const row = db.prepare('SELECT password_hash FROM users').get();
  assert.match(row.password_hash, /^scrypt\$/);
  assert.ok(!row.password_hash.includes(PASSWORD));
  const session = db.prepare('SELECT token_hash FROM sessions').get();
  assert.notEqual(session.token_hash, token);
  assert.equal(session.token_hash.length, 64);
});

test('একই Email বড় হাতের অক্ষরে আবার: EMAIL_TAKEN', () => {
  const { service, user } = domain();
  user('Rafi');
  assert.throws(() => service.register({ name: 'Rafi 2',
    email: 'RAFI@EXAMPLE.COM', password: PASSWORD }), { code: 'EMAIL_TAKEN' });
});

test('ভুল Password ও অজানা Email: একই বার্তা', () => {
  const { service, user } = domain();
  user('Rafi');
  const attempt = (email, password) => {
    try {
      service.login({ email, password });
    } catch (error) {
      return [error.code, error.message];
    }
    return null;
  };
  assert.deepEqual(attempt('rafi@example.com', 'wrong-password!!'),
    attempt('nobody@example.com', PASSWORD));
});

test('পাঁচবার ভুলের পর ১৫ মিনিট 429, তারপর আবার সুযোগ', () => {
  const { service, user, clock } = domain();
  user('Rafi');
  const login = (password) => service.login({ email: 'rafi@example.com',
    password });
  for (let i = 0; i < 5; i += 1) {
    assert.throws(() => login('wrong-password!!'), { code: 'UNAUTHORIZED' });
  }
  assert.throws(() => login(PASSWORD), { code: 'TOO_MANY_ATTEMPTS' });
  clock.now += 15 * 60_000;
  assert.ok(login(PASSWORD).token);
});

test('Token-এর মেয়াদ ও Logout', () => {
  const { service, user, clock } = domain({ tokenTtlMs: 60 * 60_000 });
  const first = user('Rafi');
  assert.equal(service.authenticate(first.token).name, 'Rafi');
  clock.now += 60 * 60_000; // ঠিক এক ঘণ্টা: মেয়াদ শেষ
  assert.throws(() => service.authenticate(first.token),
    { code: 'UNAUTHORIZED' });
  const second = service.login({ email: 'rafi@example.com',
    password: PASSWORD });
  service.logout(second.token);
  assert.throws(() => service.authenticate(second.token),
    { code: 'UNAUTHORIZED' });
  assert.throws(() => service.logout('not-a-token'), { code: 'UNAUTHORIZED' });
});
