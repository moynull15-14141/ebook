// Observer: Publisher জানে না কে শুনছে; Subscriber-রা একে অপরকে চেনে না।
export function createEventBus({ onError = () => {} } = {}) {
  const handlers = new Map();

  function on(type, handler) {
    if (!handlers.has(type)) {
      handlers.set(type, new Set());
    }
    handlers.get(type).add(handler);
    return () => handlers.get(type).delete(handler);
  }

  function emit(type, payload) {
    // Copy-র ওপর Loop: কোনো Handler নিজেকে সরালেও ক্রম ঠিক থাকে।
    for (const handler of [...(handlers.get(type) ?? [])]) {
      try {
        handler(payload);
      } catch (error) {
        onError(error, type);
      }
    }
  }

  const count = (type) => handlers.get(type)?.size ?? 0;
  return { on, emit, count };
}
