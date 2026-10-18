// Contract Test: একই Test দুটি Repository-তে। নতুন Adapter (যেমন API) যোগ হলে
// শুধু তালিকায় একটি লাইন। চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryRepository } from '../src/infra/memory-repository.mjs';
import { createStorageRepository } from '../src/infra/storage-repository.mjs';

// Node.js-এ localStorage-এর ন্যূনতম নকল (Web Storage-এর একই Method)।
class FakeStorage {
  #data = new Map();
  get length() { return this.#data.size; }
  key(index) { return [...this.#data.keys()][index] ?? null; }
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) { this.#data.set(key, String(value)); }
  removeItem(key) { this.#data.delete(key); }
}

const adapters = {
  memory: () => createMemoryRepository(),
  storage: () => createStorageRepository(new FakeStorage()),
};
const sample = (id, status = 'draft') => ({ id, applicant: 'Sara', fee: 2500, status,
  history: [{ status, action: 'create', at: '2026-10-15T10:00:00.000Z' }] });

for (const [name, create] of Object.entries(adapters)) {
  test(`${name}: save তারপর get একই তথ্য দেয়; অজানায় null`, () => {
    const repository = create();
    repository.save(sample('VF-001'));
    assert.deepEqual(repository.get('VF-001'), sample('VF-001'));
    assert.equal(repository.get('VF-404'), null);
  });

  test(`${name}: একই id আবার save করলে হালনাগাদ, নতুন সারি নয়`, () => {
    const repository = create();
    repository.save(sample('VF-001'));
    repository.save(sample('VF-001', 'submitted'));
    assert.equal(repository.list().length, 1);
    assert.equal(repository.get('VF-001').status, 'submitted');
  });

  test(`${name}: ফেরত দেওয়া Object বদলালে সংরক্ষিত তথ্য বদলায় না`, () => {
    const repository = create();
    const original = sample('VF-001');
    repository.save(original);
    original.status = 'hacked';
    repository.get('VF-001').history.push('x');
    repository.list()[0].fee = 0;
    assert.deepEqual(repository.get('VF-001'), sample('VF-001'));
  });

  test(`${name}: list id-র ক্রমে`, () => {
    const repository = create();
    for (const id of ['VF-003', 'VF-001', 'VF-002']) {
      repository.save(sample(id));
    }
    assert.deepEqual(repository.list().map((a) => a.id), ['VF-001', 'VF-002', 'VF-003']);
  });
}

test('storage: অন্য Prefix-এর Key ও ভাঙা JSON উপেক্ষিত', () => {
  const storage = new FakeStorage();
  storage.setItem('theme', 'dark');
  storage.setItem('visaflow:VF-009', '{ভাঙা');
  const repository = createStorageRepository(storage);
  repository.save(sample('VF-001'));
  assert.deepEqual(repository.list().map((a) => a.id), ['VF-001']);
  assert.equal(repository.get('VF-009'), null);
});
