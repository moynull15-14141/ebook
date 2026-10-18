class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function requireText(value, field) {
  if (typeof value !== 'string') {
    throw new TypeError(`${field}: লেখা আশা করা হয়েছিল`);
  }
  if (value.trim() === '') {
    throw new ValidationError(`${field} ঘরটি পূরণ করুন`);
  }
  return value.trim();
}

for (const value of [' Sara ', '   ', 42]) {
  try {
    console.log(`[${requireText(value, 'নাম')}]`);
  } catch (error) {
    console.log(`${error.name}: ${error.message}`);
  }
}
