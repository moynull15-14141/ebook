class ValidationError extends Error {
  constructor(fields) {
    super('কয়েকটি ঘর ঠিক করতে হবে');
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

function validateSignup({ name = '', email = '', password = '' }) {
  const fields = {};

  if (name.trim().length < 2) {
    fields.name = 'নাম কমপক্ষে 2 অক্ষর';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields.email = 'সঠিক Email';
  }
  if (password.length < 8) {
    fields.password = 'Password কমপক্ষে 8 অক্ষর';
  }
  if (Object.keys(fields).length > 0) {
    throw new ValidationError(fields);
  }
  return { name: name.trim(), email };
}

try {
  validateSignup({ name: 'S', email: 'sara@', password: '123' });
} catch (error) {
  for (const [field, message] of Object.entries(error.fields)) {
    console.log(`${field}: ${message}`);
  }
}
