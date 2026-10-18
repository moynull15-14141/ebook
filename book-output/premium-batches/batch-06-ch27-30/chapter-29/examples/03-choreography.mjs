// Choreography: কোনো কেন্দ্রীয় পরিচালক নেই। প্রতিটি Service Event শুনে
// নিজের কাজ করে এবং নতুন Event ছাড়ে। Compensation-ও Event দিয়ে।
const handlers = new Map();
const log = [];
const on = (type, fn) => handlers.set(type, [...(handlers.get(type) ?? []),
  fn]);
const emit = (type, data) => {
  log.push(type);
  for (const fn of handlers.get(type) ?? []) fn(data);
};

let seats = 5;
const declined = new Set(['Karim']);

on('booking.requested', (b) => (seats >= b.seats
  ? (seats -= b.seats, emit('seats.reserved', b))
  : emit('booking.rejected', { ...b, reason: 'SOLD_OUT' })));
on('seats.reserved', (b) => (declined.has(b.customer)
  ? emit('payment.failed', b) : emit('payment.captured', b)));
on('payment.captured', (b) => emit('booking.confirmed', b));
on('payment.failed', (b) => {
  seats += b.seats; // Inventory নিজেই শুনে আসন ফেরত দেয়
  emit('booking.rejected', { ...b, reason: 'PAYMENT_DECLINED' });
});

for (const customer of ['Rahim', 'Karim']) {
  log.length = 0;
  emit('booking.requested', { customer, seats: 2 });
  console.log(`${customer}: ${log.join(' > ')}`);
}
console.log('বাকি আসন:', seats);
