export class BookingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BookingError';
  }
}

function requireText(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new BookingError(`${field} খালি হতে পারবে না।`);
  }
  return value.trim();
}

function requirePositive(value, field) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new BookingError(`${field} একটি ধনাত্মক সংখ্যা হতে হবে।`);
  }
  return value;
}

export class Booking {
  #status = 'confirmed';

  constructor({ id, customer, price }) {
    this.id = requireText(id, 'Booking ID');
    this.customer = requireText(customer, 'গ্রাহকের নাম');
    this.price = requirePositive(price, 'দাম');
  }

  get type() {
    return 'booking';
  }

  get status() {
    return this.#status;
  }

  get isActive() {
    return this.#status === 'confirmed';
  }

  get total() {
    return this.price;
  }

  cancel() {
    if (!this.isActive) {
      throw new BookingError(`${this.id} আগেই বাতিল হয়েছে।`);
    }
    this.#status = 'cancelled';
  }

  describe() {
    return `${this.id} (${this.type}) ${this.customer}: ${this.total} টাকা, ${this.#status}`;
  }

  toJSON() {
    const { id, customer, price } = this;
    return { type: this.type, id, customer, price, status: this.#status };
  }
}

export class FlightBooking extends Booking {
  constructor({ baggageFee = 0, ...details }) {
    super(details);
    if (!Number.isFinite(baggageFee) || baggageFee < 0) {
      throw new BookingError('Baggage Fee ঋণাত্মক হতে পারবে না।');
    }
    this.baggageFee = baggageFee;
  }

  get type() {
    return 'flight';
  }

  get total() {
    return super.total + this.baggageFee;
  }

  toJSON() {
    return { ...super.toJSON(), baggageFee: this.baggageFee };
  }
}

export class HotelBooking extends Booking {
  constructor({ nights, ...details }) {
    super(details);
    if (!Number.isInteger(nights) || nights < 1) {
      throw new BookingError('রাতের সংখ্যা 1 বা বেশি পূর্ণসংখ্যা হতে হবে।');
    }
    this.nights = nights;
  }

  get type() {
    return 'hotel';
  }

  get total() {
    return this.price * this.nights;
  }

  toJSON() {
    return { ...super.toJSON(), nights: this.nights };
  }
}

const KINDS = { booking: Booking, flight: FlightBooking, hotel: HotelBooking };

// সংরক্ষিত JSON থেকে সঠিক Class-এর Booking, বাতিল অবস্থাসহ।
export function restoreBooking(data) {
  if (!Object.hasOwn(KINDS, data?.type)) {
    throw new BookingError(`অচেনা Booking-এর ধরন: ${data?.type}`);
  }
  const booking = new KINDS[data.type](data);
  if (data.status === 'cancelled') {
    booking.cancel();
  }
  return booking;
}
