// Domain-এর নিয়ম ভাঙলে এই Error; code দিয়ে UI বা Test সিদ্ধান্ত নেয়।
export class DomainError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}
