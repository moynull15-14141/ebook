export class BookingError extends Error {
  constructor(message) { super(message); this.name = 'BookingError'; }
}

export class Booking {
  #id;
  #customer;
  #price;
  #status = 'confirmed';
  constructor({ id, customer, price }) {
    if (typeof id !== 'string' || !id.trim()) throw new BookingError('Booking ID is required');
    if (typeof customer !== 'string' || !customer.trim()) throw new BookingError('Customer is required');
    if (!Number.isFinite(price) || price <= 0) throw new BookingError('Price must be positive');
    this.#id = id.trim();
    this.#customer = customer.trim();
    this.#price = price;
  }
  get id() { return this.#id; }
  get customer() { return this.#customer; }
  get price() { return this.#price; }
  get status() { return this.#status; }
  get type() { return 'General'; }
  get total() { return this.#price; }
  cancel() {
    if (this.#status === 'cancelled') throw new BookingError('Already cancelled');
    this.#status = 'cancelled';
  }
  toJSON() { return { id: this.id, customer: this.customer, price: this.price, type: this.type, total: this.total, status: this.status }; }
}

export class FlightBooking extends Booking {
  #baggageFee;
  constructor({ baggageFee = 0, ...data }) {
    super(data);
    if (!Number.isFinite(baggageFee) || baggageFee < 0) throw new BookingError('Invalid baggage fee');
    this.#baggageFee = baggageFee;
  }
  get type() { return 'Flight'; }
  get total() { return this.price + this.#baggageFee; }
  toJSON() { return { ...super.toJSON(), baggageFee: this.#baggageFee }; }
}

export class HotelBooking extends Booking {
  #nights;
  constructor({ nights, ...data }) {
    super(data);
    if (!Number.isInteger(nights) || nights < 1) throw new BookingError('Nights must be a positive integer');
    this.#nights = nights;
  }
  get type() { return 'Hotel'; }
  get total() { return this.price * this.#nights; }
  toJSON() { return { ...super.toJSON(), nights: this.#nights }; }
}

export class BookingManager {
  #bookings = new Map();
  add(booking) {
    if (!(booking instanceof Booking)) throw new TypeError('Expected Booking');
    if (this.#bookings.has(booking.id)) throw new BookingError('Duplicate booking ID');
    this.#bookings.set(booking.id, booking);
    return booking;
  }
  get(id) { return this.#bookings.get(id) ?? null; }
  cancel(id) {
    const booking = this.get(id);
    if (!booking) throw new BookingError('Booking not found');
    booking.cancel();
    return booking;
  }
  list({ status = 'all' } = {}) {
    return [...this.#bookings.values()].filter(b => status === 'all' || b.status === status);
  }
  get confirmedRevenue() {
    return this.list({ status: 'confirmed' }).reduce((sum, b) => sum + b.total, 0);
  }
}
