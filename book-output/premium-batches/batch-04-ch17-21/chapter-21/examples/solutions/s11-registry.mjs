function createRegistry() {
  const strategies = new Map();
  return {
    register(name, strategy) {
      const valid = typeof strategy?.label === 'string'
        && Number.isInteger(strategy.maxTravelers) && strategy.maxTravelers > 0
        && typeof strategy.fee === 'function';
      if (!valid) {
        throw new TypeError(`${name}: label, maxTravelers ও fee প্রয়োজন`);
      }
      if (strategies.has(name)) {
        throw new Error(`${name} আগেই নিবন্ধিত`);
      }
      strategies.set(name, Object.freeze({ ...strategy }));
    },
    get: (name) => strategies.get(name) ?? null,
    names: () => [...strategies.keys()],
  };
}

const registry = createRegistry();
registry.register('transit',
  { label: 'Transit', maxTravelers: 4, fee: () => 1200 });
for (const [name, strategy] of [['bad', { label: 'Bad' }], ['transit', {}]]) {
  try {
    registry.register(name, strategy);
  } catch (error) {
    console.log(error.name, error.message);
  }
}
console.log(registry.names(), registry.get('transit').fee());
