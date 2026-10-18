import { createMemoryRepository }
  from '../../project/visa-flow/src/infra/memory-repository.mjs';

function withCounting(repository) {
  const counts = { save: 0, get: 0 };
  return {
    counts,
    save(item) {
      counts.save += 1;
      return repository.save(item);
    },
    get(id) {
      counts.get += 1;
      return repository.get(id);
    },
    list: () => repository.list(),
  };
}

const repository = withCounting(createMemoryRepository());
repository.save({ id: 'VF-001', status: 'draft' });
repository.get('VF-001');
repository.get('VF-002');
console.log(repository.counts, repository.list().length);
