// ত্রুটির পরিবারের Unit Test।  চালানোর Command (Project Folder থেকে):  node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AppError, ValidationError, SoldOutError, PaymentError } from '../src/errors.mjs';

test('new.target.name: প্রতিটি Class-এর নিজের নাম, আলাদা করে লেখা ছাড়াই', () => {
  assert.equal(new ValidationError({}).name, 'ValidationError');
  assert.equal(new SoldOutError(3).name, 'SoldOutError');
  assert.equal(new PaymentError('x').name, 'PaymentError');
  assert.equal(new AppError('x').name, 'AppError');
});

test('instanceof শিকল: সবাই AppError ও Error', () => {
  for (const error of [new ValidationError({}), new SoldOutError(0), new PaymentError('x')]) {
    assert.ok(error instanceof AppError && error instanceof Error);
  }
  assert.ok(!(new SoldOutError(0) instanceof PaymentError));
});

test('code, retryable ও অতিরিক্ত Property', () => {
  const soldOut = new SoldOutError(4);
  assert.equal(soldOut.code, 'SOLD_OUT');
  assert.equal(soldOut.left, 4);
  assert.equal(soldOut.message, 'যথেষ্ট আসন নেই; বাকি 4টি।');
  assert.equal(soldOut.retryable, false);
  assert.equal(new PaymentError('busy', { retryable: true }).retryable, true);
  assert.deepEqual(new ValidationError({ seats: 'x' }).fields, { seats: 'x' });
});

test('cause সংরক্ষিত থাকে', () => {
  const low = new Error('socket hang up');
  const error = new PaymentError('Gateway পৌঁছানো যায়নি', { retryable: true, cause: low });
  assert.equal(error.cause, low);
  assert.equal(error.code, 'PAYMENT');
});
