import { createEventBus } from '../../project/visa-flow/src/app/events.mjs';

function once(bus, type, handler) {
  const off = bus.on(type, (payload) => {
    off();
    handler(payload);
  });
  return off;
}

const bus = createEventBus();
once(bus, 'ready', (n) => console.log(`প্রথমবার: ${n}`));
bus.emit('ready', 1);
bus.emit('ready', 2);
console.log(bus.count('ready'));
