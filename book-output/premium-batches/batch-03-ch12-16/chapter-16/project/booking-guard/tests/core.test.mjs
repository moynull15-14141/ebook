// Unit ও Boundary Test: যাচাই ও দাম।  চালানোর Command (Project Folder থেকে):  node --test
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateRequest, priceFor, MAX_SEATS, SEAT_PRICE } from '../src/booking-core.mjs';
import { ValidationError } from '../src/errors.mjs';

const good = { customer: '  Sara ', email: ' Sara@Example.COM ', seats: 2 };
const fieldsOf = (raw) => {
  try {
    validateRequest(raw);
    return [];
  } catch (error) {
    assert.ok(error instanceof ValidationError);
    return Object.keys(error.fields);
  }
};

describe('validateRequest', () => {
  it('বৈধ অনুরোধ পরিষ্কার করে: নাম trim, Email ছোট হাতের অক্ষরে', () => {
    assert.deepEqual(validateRequest(good), { customer: 'Sara', email: 'sara@example.com', seats: 2 });
  });

  it('Boundary: 0 ও 11 আসন বাতিল, 1 ও 10 গৃহীত', () => {
    assert.deepEqual(fieldsOf({ ...good, seats: 0 }), ['seats']);
    assert.deepEqual(fieldsOf({ ...good, seats: 1 }), []);
    assert.deepEqual(fieldsOf({ ...good, seats: MAX_SEATS }), []);
    assert.deepEqual(fieldsOf({ ...good, seats: MAX_SEATS + 1 }), ['seats']);
  });

  it('আসন পূর্ণসংখ্যা হতে হবে; লেখা বা দশমিক নয়', () => {
    for (const seats of [1.5, '2', null, NaN]) {
      assert.deepEqual(fieldsOf({ ...good, seats }), ['seats'], String(seats));
    }
  });

  it('Boundary: নাম 1 অক্ষর বাতিল, 2 অক্ষর গৃহীত', () => {
    assert.deepEqual(fieldsOf({ ...good, customer: ' S ' }), ['customer']);
    assert.deepEqual(fieldsOf({ ...good, customer: 'Sa' }), []);
  });

  it('সব ভুল একসঙ্গে, বার্তাসহ; ফাঁকা বা null ইনপুটেও', () => {
    assert.deepEqual(fieldsOf(null), ['customer', 'email', 'seats']);
    try {
      validateRequest({ customer: 'Sara', email: 'sara@', seats: 3 });
    } catch (error) {
      assert.equal(error.fields.email, 'সঠিক একটি Email লিখুন।');
      assert.equal(error.code, 'VALIDATION');
    }
  });
});

describe('priceFor', () => {
  it('Boundary: 4 আসনে ছাড় নেই, 5 আসন থেকে 10% গ্রুপ ছাড়', () => {
    assert.equal(priceFor(4), 4 * SEAT_PRICE);
    assert.equal(priceFor(5), 1575);
  });

  it('ছাড় নিকটতম টাকায় রাউন্ড; 1 ও 10 আসন', () => {
    assert.equal(priceFor(1), 350);
    assert.equal(priceFor(10), 3150);
    assert.ok(Number.isInteger(priceFor(7)));
  });
});
