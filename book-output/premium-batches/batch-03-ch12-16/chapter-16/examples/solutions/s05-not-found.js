class AppError extends Error {
  constructor(message, { code } = {}) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

class NotFoundError extends AppError {
  constructor(what) {
    super(`${what} পাওয়া যায়নি`, { code: 'NOT_FOUND' });
  }
}

const error = new NotFoundError('Booking B-9');
console.log(error.name, error.code, error.message, error instanceof AppError);
