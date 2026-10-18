import { createVisaService } from '../../project/visa-flow/src/app/service.mjs';
import { createEventBus } from '../../project/visa-flow/src/app/events.mjs';
import { createSequence } from '../../project/visa-flow/src/app/ids.mjs';

function createJsonRepository() {
  let json = '{}';
  const all = () => JSON.parse(json);
  return {
    save(item) {
      json = JSON.stringify({ ...all(), [item.id]: item });
    },
    get: (id) => (Object.hasOwn(all(), id) ? all()[id] : null),
    list: () => Object.values(all()).toSorted((a, b) => a.id.localeCompare(b.id)),
    size: () => json.length,
  };
}

const repository = createJsonRepository();
const service = createVisaService({
  repository, events: createEventBus(), nextId: createSequence('VF'),
});
service.create({
  applicant: 'Sara', country: 'Japan', visaType: 'student', travelers: 1,
});
service.act('VF-001', 'submit');
const rows = service.list().map((a) => `${a.id} ${a.status}`);
console.log(rows, repository.size() > 0);
