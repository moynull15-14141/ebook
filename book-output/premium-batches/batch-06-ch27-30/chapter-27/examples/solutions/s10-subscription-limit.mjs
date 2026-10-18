import { LiveHub, LiveError } from '../../project/travel-live/src/live-hub.mjs';

// প্রতি Connection-এ সর্বোচ্চ max-টি Subscription: একটি Client হাজার
// Room-এ যুক্ত হয়ে Server-এর Memory শেষ করতে পারবে না।
function limitedSubscriber(hub, userId, max) {
  const active = new Map();
  return {
    subscribe(bookingId, listener) {
      if (active.size >= max) {
        throw new LiveError('LIMIT', `সর্বোচ্চ ${max}টি Subscription`);
      }
      const result = hub.subscribe(userId, bookingId, listener);
      active.set(bookingId, result.unsubscribe);
      return result;
    },
    unsubscribe(bookingId) {
      active.get(bookingId)?.();
      active.delete(bookingId);
    },
  };
}

const hub = new LiveHub();
hub.addUser({ id: 'nadia', role: 'agent' });
hub.addUser({ id: 'rafi', role: 'customer' });
for (let i = 0; i < 3; i += 1) hub.createBooking('rafi', `Tour ${i + 1}`);

const conn = limitedSubscriber(hub, 'nadia', 2);
for (const id of ['bk-1', 'bk-2', 'bk-3']) {
  try {
    conn.subscribe(id, () => {});
    console.log(id, 'subscribed');
  } catch (error) {
    console.log(id, error.code, error.message);
  }
}
conn.unsubscribe('bk-1');
conn.subscribe('bk-3', () => {});
console.log('bk-3 subscribed after unsubscribe; bk-1 count =',
  hub.subscriberCount('bk-1'));
