// Observer / Pub-Sub pattern: the application layer emits domain events.
export function createEventBus(){
  const subscribers=new Map();
  return {
    on(type,handler){const set=subscribers.get(type)||new Set();set.add(handler);subscribers.set(type,set);return ()=>{set.delete(handler);if(!set.size)subscribers.delete(type)}},
    emit(type,payload){for(const handler of subscribers.get(type)||[])handler(payload)}
  };
}
