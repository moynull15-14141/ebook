// Service ও Event Bus-এর Test: সব নির্ভরতা Inject করা (নকল ঘড়ি, ID, Repository)।
// চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { createVisaService } from '../src/app/service.mjs';
import { createEventBus } from '../src/app/events.mjs';
import { createSequence, sequenceAfter } from '../src/app/ids.mjs';
import { createMemoryRepository } from '../src/infra/memory-repository.mjs';

function setup(repository = createMemoryRepository()) {
  const events = createEventBus();
  const seen = [];
  events.on('application:created', (e) => seen.push(['created', e]));
  events.on('application:changed', (e) => seen.push(['changed', e]));
  const service = createVisaService({
    repository, events, nextId: createSequence('VF'),
    clock: () => new Date('2026-10-15T10:00:00Z'),
  });
  return { service, seen };
}
const input = { applicant: 'Mina', country: 'Japan', visaType: 'tourist', travelers: 2 };

test('create: সংরক্ষণ ও Event', () => {
  const { service, seen } = setup();
  const created = service.create(input);
  assert.equal(created.id, 'VF-001');
  assert.deepEqual(service.list().map((a) => a.id), ['VF-001']);
  assert.deepEqual(seen, [['created', { id: 'VF-001', status: 'draft', fee: 6000 }]]);
});

test('act: অবস্থা বদল, সংরক্ষণ ও from/to Event', () => {
  const { service, seen } = setup();
  service.create(input);
  service.act('VF-001', 'submit');
  assert.equal(service.list()[0].status, 'submitted');
  assert.deepEqual(seen.at(-1), ['changed',
    { id: 'VF-001', action: 'submit', from: 'draft', to: 'submitted' }]);
});

test('ব্যর্থ কাজ: কিছুই সংরক্ষিত হয় না, কোনো Event নেই', () => {
  const { service, seen } = setup();
  service.create(input);
  assert.throws(() => service.act('VF-001', 'approve'), { code: 'INVALID_TRANSITION' });
  assert.throws(() => service.act('VF-404', 'submit'), { code: 'NOT_FOUND' });
  assert.throws(() => service.create({ ...input, country: 'Mars' }),
    { code: 'INVALID_COUNTRY' });
  assert.equal(service.list()[0].status, 'draft');
  assert.equal(service.list().length, 1);
  assert.equal(seen.length, 1);
});

test('ব্যর্থ create কোনো ID খরচ করে না', () => {
  const { service } = setup();
  assert.throws(() => service.create({ ...input, applicant: 'R' }));
  assert.throws(() => service.create({ ...input, travelers: 99 }));
  assert.equal(service.create(input).id, 'VF-001');
  assert.equal(service.create(input).id, 'VF-002');
});

test('sequenceAfter: সবচেয়ে বড় সংখ্যার পর থেকে, ফাঁক থাকলেও', () => {
  assert.equal(sequenceAfter('VF', ['VF-001', 'VF-004'])(), 'VF-005');
  assert.equal(sequenceAfter('VF', [])(), 'VF-001');
  assert.equal(sequenceAfter('VF', ['VF-002', 'odd-id', 'VF-x'])(), 'VF-003');
});

test('summary: অবস্থাভিত্তিক গণনা ও অনুমোদিত Fee', () => {
  const { service } = setup();
  service.create(input);
  service.create({ ...input, visaType: 'student', travelers: 1 });
  service.create(input);
  service.act('VF-001', 'submit');
  service.act('VF-001', 'approve');
  service.act('VF-002', 'withdraw');
  assert.deepEqual(service.summary(),
    { counts: { approved: 1, withdrawn: 1, draft: 1 }, approvedFees: 6000 });
});

test('DI: যেকোনো চুক্তি-মানা Repository চলে (রেকর্ডিং নকল)', () => {
  const calls = [];
  const store = new Map();
  const spyRepository = {
    save: (a) => { calls.push(`save ${a.id} ${a.status}`); store.set(a.id, a); },
    get: (id) => { calls.push(`get ${id}`); return store.get(id) ?? null; },
    list: () => [...store.values()],
  };
  const { service } = setup(spyRepository);
  service.create(input);
  service.act('VF-001', 'submit');
  assert.deepEqual(calls, ['save VF-001 draft', 'get VF-001', 'save VF-001 submitted']);
});

test('Event Bus: ক্রম, Unsubscribe, এবং একটি Handler-এর Error অন্যদের থামায় না', () => {
  const errors = [];
  const bus = createEventBus({ onError: (error, type) => errors.push(`${type}: ${error.message}`) });
  const order = [];
  const off = bus.on('x', () => order.push('a'));
  bus.on('x', () => { throw new Error('ভাঙা'); });
  bus.on('x', () => order.push('c'));
  bus.emit('x');
  off();
  bus.emit('x');
  bus.emit('nobody-listens');
  assert.deepEqual(order, ['a', 'c', 'c']);
  assert.deepEqual(errors, ['x: ভাঙা', 'x: ভাঙা']);
  assert.equal(bus.count('x'), 2);
});

test('Event Bus: Handler নিজেকে সরালেও একই emit-এ বাকিরা চলে', () => {
  const bus = createEventBus();
  const order = [];
  const offFirst = bus.on('y', () => { order.push(1); offFirst(); });
  bus.on('y', () => order.push(2));
  bus.emit('y');
  bus.emit('y');
  assert.deepEqual(order, [1, 2, 2]);
});
