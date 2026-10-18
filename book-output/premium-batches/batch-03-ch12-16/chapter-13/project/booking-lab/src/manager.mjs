import { Booking, BookingError, restoreBooking } from './booking.mjs';

export class BookingManager {
  #bookings = [];
  #notify;

  // Composition: Manager-এর একটি Notifier আছে, যা বাইরে থেকে দেওয়া হয়।
  constructor({ notify = () => {} } = {}) {
    this.#notify = notify;
  }

  add(booking) {
    if (!(booking instanceof Booking)) {
      throw new TypeError('শুধু Booking যোগ করা যায়');
    }
    if (this.find(booking.id)) {
      throw new BookingError(`${booking.id} আগে থেকেই আছে।`);
    }
    this.#bookings.push(booking);
    this.#notify(`নতুন: ${booking.describe()}`);
    return booking;
  }

  find(id) {
    return this.#bookings.find((booking) => booking.id === id) ?? null;
  }

  cancel(id) {
    const booking = this.find(id);
    if (!booking) {
      throw new BookingError(`${id} পাওয়া যায়নি।`);
    }
    booking.cancel();
    this.#notify(`বাতিল: ${id}`);
  }

  get count() {
    return this.#bookings.length;
  }

  get confirmedRevenue() {
    return this.#bookings
      .filter((booking) => booking.isActive)
      .reduce((sum, booking) => sum + booking.total, 0);
  }

  revenueByType() {
    const revenue = {};
    for (const booking of this.#bookings.filter((item) => item.isActive)) {
      revenue[booking.type] = (revenue[booking.type] ?? 0) + booking.total;
    }
    return revenue;
  }

  list() {
    return [...this.#bookings];
  }

  toJSON() {
    return this.#bookings.map((booking) => booking.toJSON());
  }

  static fromJSON(items, options = {}) {
    const manager = new BookingManager();
    for (const item of items) {
      manager.add(restoreBooking(item));
    }
    manager.#notify = options.notify ?? (() => {});
    return manager;
  }
}
