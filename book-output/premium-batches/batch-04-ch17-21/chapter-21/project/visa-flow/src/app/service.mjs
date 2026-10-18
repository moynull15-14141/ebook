import { createApplication } from '../domain/application.mjs';
import { applyAction } from '../domain/workflow.mjs';
import { DomainError } from '../domain/errors.mjs';

// Application Service: Use Case-গুলো সমন্বয় করে। কোন Repository বা কোন UI,
// তা জানে না; সব নির্ভরতা Constructor-এ আসে (Dependency Injection)।
export function createVisaService(deps) {
  const { repository, events, nextId, clock = () => new Date() } = deps;

  function create(input) {
    const context = { newId: nextId, now: clock() };
    const application = createApplication(input, context);
    repository.save(application);
    const { id, status, fee } = application;
    events.emit('application:created', { id, status, fee });
    return application;
  }

  function act(id, action) {
    const current = repository.get(id);
    if (!current) {
      throw new DomainError('NOT_FOUND', `${id} নামে কোনো আবেদন নেই`);
    }
    const next = applyAction(current, action, clock());
    repository.save(next);
    events.emit('application:changed',
      { id, action, from: current.status, to: next.status });
    return next;
  }

  function summary() {
    const counts = {};
    let approvedFees = 0;
    for (const application of repository.list()) {
      counts[application.status] = (counts[application.status] ?? 0) + 1;
      if (application.status === 'approved') {
        approvedFees += application.fee;
      }
    }
    return { counts, approvedFees };
  }

  return { create, act, summary, list: () => repository.list() };
}
