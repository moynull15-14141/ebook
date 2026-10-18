import { createEventBus } from '../../project/visa-flow/src/app/events.mjs';

const bus = createEventBus();
const audit = [];
const stop = bus.on('application:changed', (event) => {
  audit.push(`${event.id}:${event.to}`);
  if (audit.length === 3) {
    stop();
  }
});

for (const to of ['submitted', 'documents-requested', 'submitted', 'approved']) {
  bus.emit('application:changed', { id: 'VF-001', to });
}
console.log(audit.join(' | '), bus.count('application:changed'));
