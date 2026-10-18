import { test } from 'node:test';
import assert from 'node:assert/strict';

function createUserRepository() {
  const users = new Map();
  return {
    async add(user) {
      const key = user.email.toLowerCase();
      if (users.has(key)) {
        throw new Error('Email আগে থেকেই আছে');
      }
      users.set(key, structuredClone(user));
    },
    async findByEmail(email) {
      const user = users.get(email.toLowerCase());
      return user ? structuredClone(user) : null;
    },
  };
}

test('যোগ ও খোঁজা, বড়-ছোট হাতের অক্ষর নির্বিশেষে', async () => {
  const repo = createUserRepository();
  await repo.add({ email: 'Sara@Example.com', name: 'Sara' });
  assert.equal((await repo.findByEmail('sara@example.com')).name, 'Sara');
  assert.equal(await repo.findByEmail('x@y.z'), null);
});

test('একই Email দুবার নয়; সংরক্ষিত Object অক্ষত', async () => {
  const repo = createUserRepository();
  await repo.add({ email: 'a@b.co', name: 'A' });
  await assert.rejects(repo.add({ email: 'A@B.CO', name: 'B' }), /আগে থেকেই/);
  const found = await repo.findByEmail('a@b.co');
  found.name = 'বদলানো';
  assert.equal((await repo.findByEmail('a@b.co')).name, 'A');
});
