import { BookingView } from '../project/travel-live/src/client-state.mjs';

const ev = (eventId, sequence, status) => ({ eventId, bookingId: 'bk-7',
  sequence, payload: { status } });

// Network-এ যা ঘটতে পারে: Retry-তে Duplicate, দেরিতে আসা, মাঝখানে হারানো।
const arrivals = [
  ev('e1', 1, 'PENDING'),
  ev('e2', 2, 'CONFIRMED'),
  ev('e2', 2, 'CONFIRMED'),
  ev('e4', 4, 'REFUNDED'),
  ev('e1', 1, 'PENDING'),
];
const view = new BookingView();
for (const event of arrivals) {
  console.log(`${event.eventId} (#${event.sequence}):`, view.apply(event));
}
console.log('দেখানো অবস্থা:', view.get('bk-7'));

// ফাঁক (#৩ নেই): Server থেকে Snapshot এনে তারপর এগোনো।
view.loadSnapshot({ bookingId: 'bk-7', title: 'Sajek', status: 'CANCELLED',
  sequence: 3 });
console.log('Snapshot-এর পরে #4:', view.apply(ev('e4', 4, 'REFUNDED')));
console.log('দেখানো অবস্থা:', view.get('bk-7'));
