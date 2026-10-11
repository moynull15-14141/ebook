import { createInventory, createPaymentGateway, createBookingRepository, createTravelSaga } from './saga.mjs';
const inventory = createInventory({ seats: 2 });
const payments = createPaymentGateway();
const bookings = createBookingRepository();
const saga = createTravelSaga({ inventory, payments, bookings });
console.log(await saga.book({ id: 'trip-101', customer: 'Rahim', amount: 12500000 }));
console.log({ inventory: inventory.snapshot(), charges: payments.snapshot(), bookings: bookings.all() });
