import { createEvent, isValidEvent }
  from '../project/travel-live/src/events.mjs';

const event = createEvent({ id: 'evt-102', type: 'booking.status.changed',
  bookingId: 'bk-22', sequence: 8, payload: { status: 'CONFIRMED' },
  now: new Date('2026-10-11T00:00:00Z') });
console.log(JSON.stringify(event, null, 2));

// Network থেকে আসা কয়েকটি সন্দেহজনক Message।
const incoming = [
  JSON.stringify(event),
  '{"type":"booking.status.changed","sequence":"8"}',
  JSON.stringify({ ...event, version: 2 }),
  JSON.stringify({ ...event, sequence: 0 }),
];
for (const text of incoming) {
  const value = JSON.parse(text);
  console.log(isValidEvent(value) ? 'গ্রহণ' : 'বাতিল', value.sequence,
    value.version);
}
