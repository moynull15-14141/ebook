function createEventBus() {
  const handlers = new Map();
  return {
    on(type, handler) {
      if (!handlers.has(type)) {
        handlers.set(type, new Set());
      }
      handlers.get(type).add(handler);
      return () => handlers.get(type).delete(handler);
    },
    emit(type, payload) {
      for (const handler of [...(handlers.get(type) ?? [])]) {
        handler(payload);
      }
    },
  };
}

const bus = createEventBus();
const stopEmail = bus.on('approved', (id) => {
  console.log(`Email: ${id} অনুমোদিত`);
});
bus.on('approved', (id) => console.log(`Report হালনাগাদ: ${id}`));

bus.emit('approved', 'VF-001');
stopEmail();
bus.emit('approved', 'VF-002');
