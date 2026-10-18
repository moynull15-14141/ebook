class AppError extends Error {
  constructor(message, { code, retryable = false, cause } = {}) {
    super(message, { cause });
    this.name = new.target.name;
    this.code = code;
    this.retryable = retryable;
  }
}

class DatabaseError extends AppError {}
class SaveFailedError extends AppError {}

function causeChain(error) {
  const chain = [];
  for (let current = error; current; current = current.cause) {
    chain.push(`${current.name}: ${current.message}`);
  }
  return chain;
}

const low = new Error('connection reset');
const middle = new DatabaseError('INSERT ব্যর্থ', {
  code: 'DB_WRITE', retryable: true, cause: low,
});
const outer = new SaveFailedError('Booking সংরক্ষণ হয়নি', {
  code: 'SAVE', cause: middle,
});

console.log(causeChain(outer).join('\n  <- '));
console.log(outer instanceof AppError, outer.code, middle.retryable);
