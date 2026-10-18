// Composition Root (Node.js): একই Service, কিন্তু Memory Repository
// ও নির্দিষ্ট ঘড়ি।
import { createVisaService } from './src/app/service.mjs';
import { createEventBus } from './src/app/events.mjs';
import { createSequence } from './src/app/ids.mjs';
import { createMemoryRepository } from './src/infra/memory-repository.mjs';

const events = createEventBus();
const service = createVisaService({
  repository: createMemoryRepository(),
  events,
  nextId: createSequence('VF'),
  clock: () => new Date('2026-10-15T10:00:00Z'),
});
events.on('application:changed', (e) => {
  console.log(`  ${e.id}: ${e.from} থেকে ${e.to}`);
});

const rafi = service.create({ applicant: '  Rafi   Ahmed ', country: 'Thailand',
  visaType: 'tourist', travelers: 2 });
const mina = service.create({ applicant: 'Mina Akter', country: 'Japan',
  visaType: 'business', travelers: 1, express: true });
const sara = service.create({ applicant: 'Sara', country: 'Turkey',
  visaType: 'student', travelers: 1 });
console.log(rafi.applicant, rafi.fee, mina.fee, sara.fee);

service.act(rafi.id, 'submit');
service.act(rafi.id, 'approve');
service.act(mina.id, 'submit');
service.act(mina.id, 'requestDocuments');
service.act(sara.id, 'withdraw');

for (const [id, action] of [[sara.id, 'submit'], ['VF-999', 'submit']]) {
  try {
    service.act(id, action);
  } catch (error) {
    console.log(`  ${error.code}: ${error.message}`);
  }
}
const { counts, approvedFees } = service.summary();
console.log(counts, approvedFees);
