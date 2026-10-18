export class AppError extends Error {
  constructor(message, { code, retryable = false, cause } = {}) {
    super(message, { cause });
    this.name = new.target.name;
    this.code = code;
    this.retryable = retryable;
  }
}

export class ValidationError extends AppError {
  constructor(fields) {
    super('Booking-এর তথ্য ঠিক নেই।', { code: 'VALIDATION' });
    this.fields = fields;
  }
}

export class SoldOutError extends AppError {
  constructor(left) {
    super(`যথেষ্ট আসন নেই; বাকি ${left}টি।`, { code: 'SOLD_OUT' });
    this.left = left;
  }
}

export class PaymentError extends AppError {
  constructor(message, { retryable = false, cause } = {}) {
    super(message, { code: 'PAYMENT', retryable, cause });
  }
}
