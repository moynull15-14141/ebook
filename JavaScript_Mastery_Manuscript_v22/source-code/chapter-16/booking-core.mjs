// BookingGuard domain module: browser-independent, testable logic.
export class ValidationError extends Error {
  constructor(field, message) { super(message); this.name = 'ValidationError'; this.field = field; }
}
export class ConflictError extends Error {
  constructor(message) { super(message); this.name = 'ConflictError'; }
}
export function validateBooking(input) {
  if (!input || typeof input !== 'object') throw new ValidationError('form', 'Booking data প্রয়োজন');
  const customer = String(input.customer ?? '').trim();
  const email = String(input.email ?? '').trim().toLowerCase();
  const seats = Number(input.seats);
  const unitPrice = Number(input.unitPrice);
  if (customer.length < 2 || customer.length > 80) throw new ValidationError('customer', 'নাম ২–৮০ অক্ষরের হতে হবে');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError('email', 'সঠিক ইমেইল দিন');
  if (!Number.isSafeInteger(seats) || seats < 1 || seats > 9) throw new ValidationError('seats', 'Seat সংখ্যা ১–৯ হতে হবে');
  if (!Number.isFinite(unitPrice) || unitPrice <= 0 || unitPrice > 1_000_000) throw new ValidationError('unitPrice', 'সঠিক Unit Price দিন');
  return {customer,email,seats,unitPrice,total:Math.round(seats*unitPrice*100)/100};
}
export function createBooking(input, id) {
  const data=validateBooking(input);
  if(typeof id!=='string'||!id.trim())throw new ValidationError('id','Booking ID প্রয়োজন');
  return {...data,id,status:'confirmed'};
}
export function addBooking(bookings, booking) {
  if(!Array.isArray(bookings))throw new TypeError('Bookings must be an array');
  if(bookings.some(item=>item.id===booking.id))throw new ConflictError('Duplicate booking ID');
  return [...bookings,booking];
}
export function cancelBooking(bookings,id) {
  if(!bookings.some(item=>item.id===id))throw new ValidationError('id','Booking পাওয়া যায়নি');
  return bookings.map(item=>item.id===id?{...item,status:'cancelled'}:item);
}
export function summarizeBookings(bookings) {
  const active=bookings.filter(item=>item.status==='confirmed');
  return {totalBookings:bookings.length,confirmed:active.length,revenue:Math.round(active.reduce((sum,item)=>sum+item.total,0)*100)/100};
}
export function safeReadBookings(storage,key='bookingguard.v1') {
  try {const parsed=JSON.parse(storage.getItem(key)||'[]');return Array.isArray(parsed)?parsed.filter(x=>x&&typeof x.id==='string'&&['confirmed','cancelled'].includes(x.status)&&Number.isFinite(x.total)):[];}catch{return [];}
}
