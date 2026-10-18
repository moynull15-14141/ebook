import { BookingView } from '../../project/travel-live/src/client-state.mjs';

// ফাঁক ধরা পড়লে Server-এর Snapshot আনা; Snapshot-এর চেয়ে পুরোনো Event বাদ।
async function receive(view, event, fetchSnapshot) {
  const result = view.apply(event);
  if (result !== 'gap') return result;
  const snapshot = await fetchSnapshot(event.bookingId);
  view.loadSnapshot(snapshot);
  return `gap, snapshot #${snapshot.sequence}, ${view.apply(event)}`;
}

// Server-এর জায়গায় একটি নকল fetch; আসলে GET /api/bookings/:id।
const fakeFetch = async (bookingId) => ({ bookingId, title: 'Sajek',
  status: 'CONFIRMED', sequence: 5 });
const ev = (sequence, status) => ({ eventId: `e${sequence}`,
  bookingId: 'bk-9', sequence, payload: { status } });

const view = new BookingView();
console.log(await receive(view, ev(1, 'PENDING'), fakeFetch));
console.log(await receive(view, ev(6, 'CANCELLED'), fakeFetch));
console.log(await receive(view, ev(4, 'CONFIRMED'), fakeFetch));
console.log(view.get('bk-9'));
