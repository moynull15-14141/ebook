// At-least-once Delivery: একই Event একাধিকবার আসতে পারে।
// Consumer মনে রাখে কোন eventId-র কাজ হয়ে গেছে (সীমিত Memory-তে)।
function createConsumer(handler, { limit = 3 } = {}) {
  const done = new Set();
  return (event) => {
    if (done.has(event.eventId)) return 'skipped';
    handler(event);
    done.add(event.eventId);
    if (done.size > limit) done.delete(done.values().next().value);
    return 'handled';
  };
}

const sent = [];
const notify = createConsumer((e) => sent.push(`SMS ${e.bookingId}`));
const deliveries = ['e1', 'e2', 'e1', 'e3', 'e2', 'e4', 'e5', 'e1'];
for (const eventId of deliveries) {
  console.log(eventId, notify({ eventId, bookingId: `bk-${eventId}` }));
}
console.log('পাঠানো SMS:', sent.length);
