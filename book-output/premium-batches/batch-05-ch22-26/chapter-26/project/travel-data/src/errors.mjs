import { constraintOf } from './db.mjs';

export class DataError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'DataError';
    this.code = code;
  }
}

// Database-এর Constraint Error থেকে ব্যবসার ভাষার Error। অজানা হলে যেমন ছিল।
export function translate(error, messages = {}) {
  const constraint = constraintOf(error);
  if (!constraint) {
    return error;
  }
  const key = constraint.column ?? constraint.code;
  const message = messages[key] ?? messages[constraint.code] ?? error.message;
  return new DataError(constraint.code, message);
}
