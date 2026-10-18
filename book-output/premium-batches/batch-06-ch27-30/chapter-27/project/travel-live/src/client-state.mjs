// Client-এর দিক: Duplicate বাদ, পুরোনো Event উপেক্ষা, ফাঁকে Snapshot চাই।
// Browser ও Node.js দুই জায়গাতেই চলে (কোনো Import নেই)।
export class BookingView {
  #state = new Map();
  #seen = new Set();

  constructor({ seenLimit = 500 } = {}) {
    this.seenLimit = seenLimit;
  }

  loadSnapshot({ bookingId, title, status, sequence }) {
    this.#state.set(bookingId, { title, status, sequence });
  }

  apply(event) {
    if (this.#seen.has(event.eventId)) return 'duplicate';
    const current = this.#state.get(event.bookingId);
    const last = current?.sequence ?? 0;
    if (event.sequence <= last) return 'stale';
    if (event.sequence !== last + 1) return 'gap';
    this.#remember(event.eventId);
    this.#state.set(event.bookingId, {
      title: current?.title ?? event.payload.title ?? '',
      status: event.payload.status,
      sequence: event.sequence,
    });
    return 'applied';
  }

  lastSequence(bookingId) {
    return this.#state.get(bookingId)?.sequence ?? 0;
  }

  get(bookingId) {
    return this.#state.get(bookingId);
  }

  #remember(eventId) {
    this.#seen.add(eventId);
    if (this.#seen.size > this.seenLimit) {
      this.#seen.delete(this.#seen.values().next().value);
    }
  }
}
