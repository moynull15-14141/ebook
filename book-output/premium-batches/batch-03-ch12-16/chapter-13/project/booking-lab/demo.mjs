import { FlightBooking, HotelBooking } from './src/booking.mjs';
import { BookingManager } from './src/manager.mjs';

const messages = [];
const manager = new BookingManager({ notify: (text) => messages.push(text) });

manager.add(new FlightBooking({
  id: 'F-101', customer: 'Sara', price: 5200, baggageFee: 800,
}));
manager.add(new HotelBooking({
  id: 'H-201', customer: 'Rafi', price: 3500, nights: 3,
}));
manager.add(new FlightBooking({ id: 'F-102', customer: 'Mina', price: 4800 }));
manager.cancel('F-102');

for (const booking of manager.list()) {
  console.log(booking.describe());
}
console.log(`নিশ্চিত আয়: ${manager.confirmedRevenue} টাকা`);
console.log(manager.revenueByType());

try {
  manager.cancel('F-102');
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
}

const saved = JSON.stringify(manager);
const restored = BookingManager.fromJSON(JSON.parse(saved));
console.log(`পুনরুদ্ধার: ${restored.count}টি, আয় ${restored.confirmedRevenue}`);
console.log(restored.find('H-201') instanceof HotelBooking, messages.length);
