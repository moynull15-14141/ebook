import { openSagaStore } from '../../project/travel-saga/src/saga-store.mjs';

// Relay: Outbox থেকে Event নিয়ে Broker-এ; সফল হলে তবেই published।
async function relayOnce(store, publish) {
  let sent = 0;
  for (const event of store.pendingEvents()) {
    try {
      await publish(event);
      store.markPublished(event.id);
      sent += 1;
    } catch {
      break; // ক্রম রক্ষা: ব্যর্থ হলে পরেরগুলো পরের দফায়
    }
  }
  return sent;
}

const store = openSagaStore();
const request = { bookingId: 'trip-1', customer: 'Rahim', seats: 2,
  amount: 100 };
for (const id of ['trip-1', 'trip-2', 'trip-3']) {
  store.start(id, 'fp', { ...request, bookingId: id });
  store.transition(id, 'CONFIRMED', null, { type: 'booking.confirmed',
    payload: { bookingId: id } });
}

let brokerDown = true;
const broker = [];
const publish = async (event) => {
  if (brokerDown && event.saga_id === 'trip-2') throw new Error('down');
  broker.push(event.saga_id);
};
console.log('দফা ১:', await relayOnce(store, publish), 'টি পাঠানো');
brokerDown = false;
console.log('দফা ২:', await relayOnce(store, publish), 'টি পাঠানো');
console.log('Broker পেল:', broker.join(', '));
console.log('বাকি:', store.pendingEvents().length);
