import { Booking, BookingError } from '../../project/booking-lab/src/booking.mjs';

export class BusBooking extends Booking {
  constructor({ seats, ...details }) {
    super(details);
    if (!Number.isInteger(seats) || seats < 1 || seats > 40) {
      throw new BookingError('আসন 1 থেকে 40-এর মধ্যে হতে হবে।');
    }
    this.seats = seats;
  }

  get type() {
    return 'bus';
  }

  get total() {
    return this.price * this.seats;
  }

  toJSON() {
    return { ...super.toJSON(), seats: this.seats };
  }
}

const trip = new BusBooking({
  id: 'B-1', customer: 'Nila', price: 650, seats: 3,
});
const saved = JSON.parse(JSON.stringify(trip));

console.log(trip.describe());
console.log(saved.type, saved.seats, saved.status);
