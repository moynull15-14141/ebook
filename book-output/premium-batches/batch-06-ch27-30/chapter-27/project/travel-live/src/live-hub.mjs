import { createEvent } from './events.mjs';

// Booking-এর অবস্থা বদলের নিয়ম। CANCELLED শেষ অবস্থা।
const TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CANCELLED'],
  CANCELLED: [],
};

export class LiveError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export class LiveHub {
  #bookings = new Map();
  #history = new Map();
  #subscribers = new Map();
  #users = new Map();
  #counter = 0;

  constructor({ historyLimit = 50, now = () => new Date() } = {}) {
    this.historyLimit = historyLimit;
    this.now = now;
  }

  addUser(user) {
    this.#users.set(user.id, { ...user, active: true });
  }

  revokeUser(userId) {
    const user = this.#users.get(userId);
    if (user) user.active = false;
    this.#recheck();
  }

  canView(userId, bookingId) {
    const user = this.#users.get(userId);
    const booking = this.#bookings.get(bookingId);
    if (!user?.active || !booking) return false;
    return user.role === 'agent' || booking.ownerId === userId;
  }

  createBooking(actorId, title) {
    if (!this.#users.get(actorId)?.active) {
      throw new LiveError('UNAUTHORIZED', 'অজানা বা বাতিল ব্যবহারকারী');
    }
    const id = `bk-${this.#bookings.size + 1}`;
    const booking = { id, ownerId: actorId, title, status: 'PENDING',
      sequence: 0 };
    this.#bookings.set(id, booking);
    this.#history.set(id, []);
    return this.#record(booking, 'booking.created',
      { status: 'PENDING', title });
  }

  changeStatus(actorId, bookingId, status) {
    if (!this.canView(actorId, bookingId)) {
      throw new LiveError('FORBIDDEN', 'এই Booking বদলানোর অনুমতি নেই');
    }
    const booking = this.#bookings.get(bookingId);
    const actor = this.#users.get(actorId);
    if (status === 'CONFIRMED' && actor.role !== 'agent') {
      throw new LiveError('FORBIDDEN', 'শুধু Agent নিশ্চিত করতে পারেন');
    }
    if (!TRANSITIONS[booking.status].includes(status)) {
      throw new LiveError('INVALID_TRANSITION',
        `${booking.status} থেকে ${status} সম্ভব নয়`);
    }
    const from = booking.status;
    booking.status = status;
    return this.#record(booking, 'booking.status.changed', { from, status });
  }

  snapshot(userId, bookingId) {
    if (!this.canView(userId, bookingId)) {
      throw new LiveError('FORBIDDEN', 'এই Booking দেখার অনুমতি নেই');
    }
    const { id, title, status, sequence } = this.#bookings.get(bookingId);
    return { bookingId: id, title, status, sequence };
  }

  // Subscribe-এর সময় অনুমতি যাচাই; afterSequence-এর পরের Event Replay,
  // আর History-তে ফাঁক থাকলে পূর্ণ Snapshot।
  subscribe(userId, bookingId, listener, { afterSequence = 0,
    onClose = () => {} } = {}) {
    if (!this.canView(userId, bookingId)) {
      throw new LiveError('FORBIDDEN', 'এই Booking দেখার অনুমতি নেই');
    }
    const sub = { userId, listener, onClose };
    const subs = this.#subscribers.get(bookingId) ?? new Set();
    subs.add(sub);
    this.#subscribers.set(bookingId, subs);
    const history = this.#history.get(bookingId);
    const oldest = history[0]?.sequence ?? 1;
    const recovery = afterSequence + 1 < oldest
      ? { mode: 'snapshot', snapshot: this.snapshot(userId, bookingId) }
      : { mode: 'replay',
        events: history.filter((e) => e.sequence > afterSequence) };
    return { ...recovery, unsubscribe: () => subs.delete(sub) };
  }

  subscriberCount(bookingId) {
    return this.#subscribers.get(bookingId)?.size ?? 0;
  }

  #record(booking, type, payload) {
    booking.sequence += 1;
    this.#counter += 1;
    const event = createEvent({ id: `evt-${this.#counter}`, type,
      bookingId: booking.id, sequence: booking.sequence, payload,
      now: this.now() });
    const history = this.#history.get(booking.id);
    history.push(event);
    if (history.length > this.historyLimit) history.shift();
    this.#dispatch(event);
    return event;
  }

  // Dispatch-এর সময়ও অনুমতি আবার যাচাই: বাতিল ব্যবহারকারী কিছু পান না।
  #dispatch(event) {
    for (const sub of this.#subscribers.get(event.bookingId) ?? []) {
      if (this.canView(sub.userId, event.bookingId)) sub.listener(event);
      else this.#close(event.bookingId, sub);
    }
  }

  #recheck() {
    for (const [bookingId, subs] of this.#subscribers) {
      for (const sub of subs) {
        if (!this.canView(sub.userId, bookingId)) this.#close(bookingId, sub);
      }
    }
  }

  #close(bookingId, sub) {
    this.#subscribers.get(bookingId).delete(sub);
    sub.onClose('FORBIDDEN');
  }
}
