import { ValidationError } from './errors.mjs';

export const MAX_SEATS = 10;
export const SEAT_PRICE = 350;
export const GROUP_SIZE = 5;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRequest(raw) {
  const customer = String(raw?.customer ?? '').trim();
  const email = String(raw?.email ?? '').trim().toLowerCase();
  const seats = raw?.seats;
  const fields = {};

  if (customer.length < 2) {
    fields.customer = 'নাম কমপক্ষে 2 অক্ষরের হতে হবে।';
  }
  if (!EMAIL.test(email)) {
    fields.email = 'সঠিক একটি Email লিখুন।';
  }
  if (!Number.isInteger(seats) || seats < 1 || seats > MAX_SEATS) {
    fields.seats = `আসন 1 থেকে ${MAX_SEATS}-এর মধ্যে হতে হবে।`;
  }
  if (Object.keys(fields).length > 0) {
    throw new ValidationError(fields);
  }
  return { customer, email, seats };
}

export function priceFor(seats) {
  const subtotal = seats * SEAT_PRICE;
  return seats >= GROUP_SIZE ? Math.round(subtotal * 0.9) : subtotal;
}
