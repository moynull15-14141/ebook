import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const SEAT_PRICE = 350;
const priceFor = (seats) => {
  const subtotal = seats * SEAT_PRICE;
  return seats >= 5 ? Math.round(subtotal * 0.9) : subtotal;
};

describe('priceFor', () => {
  let seatCounts;

  beforeEach(() => {
    seatCounts = [];
  });

  it('৪ আসনে ছাড় নেই', () => {
    assert.equal(priceFor(4), 1400);
  });

  it('৫ আসন থেকে ১০% গ্রুপ ছাড়', () => {
    assert.equal(priceFor(5), 1575);
  });

  it('প্রতিটি Test নতুন অবস্থায় শুরু হয়', () => {
    seatCounts.push(1);
    assert.deepEqual(seatCounts, [1]);
  });

  it.todo('আসনের সর্বোচ্চ সীমা');
});
