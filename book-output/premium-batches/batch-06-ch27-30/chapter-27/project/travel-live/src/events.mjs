// Event Envelope: প্রতিটি Event-এর একই কাঠামো, যাতে Client নিশ্চিন্তে পড়তে পারে।
export const EVENT_VERSION = 1;

export function createEvent({ id, type, bookingId, sequence, payload, now }) {
  return Object.freeze({
    eventId: id,
    type,
    version: EVENT_VERSION,
    bookingId,
    sequence,
    occurredAt: now.toISOString(),
    payload: Object.freeze({ ...payload }),
  });
}

// Network থেকে আসা Event বিশ্বাস করবেন না: আকার ও ধরন যাচাই করুন।
export function isValidEvent(value) {
  return value !== null && typeof value === 'object'
    && typeof value.eventId === 'string' && value.eventId.length > 0
    && typeof value.type === 'string'
    && value.version === EVENT_VERSION
    && typeof value.bookingId === 'string'
    && Number.isInteger(value.sequence) && value.sequence > 0
    && typeof value.payload === 'object' && value.payload !== null;
}
