class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

function parseAge(text) {
  const age = Number(text);

  if (!Number.isInteger(age) || age < 0 || age > 150) {
    throw new ValidationError('age', `বয়স সঠিক নয়: "${text}"`);
  }
  return age;
}

for (const input of ['32', 'abc', '-4']) {
  try {
    console.log(`বয়স: ${parseAge(input)}`);
  } catch (error) {
    if (!(error instanceof ValidationError)) {
      throw error;
    }
    console.log(`${error.field} ঘরে: ${error.message}`);
  }
}
