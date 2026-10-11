/** Order Validation: pure domain logic; all prices in integer BDT. */
export class ValidationError extends Error {
  constructor(message, issues = []) { super(message); this.name = 'ValidationError'; this.issues = issues; }
}
export function parseQuantity(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const text = String(value).trim();
  if (!/^[1-9]\d*$/.test(text)) return null;
  const n = Number(text);
  return Number.isSafeInteger(n) && n <= 100 ? n : null;
}
export function validateOrder(raw, catalog) {
  const issues = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new ValidationError('Invalid order', ['Order must be an object']);
  const customer = typeof raw.customer === 'string' ? raw.customer.trim() : '';
  if (customer.length < 2 || customer.length > 80) issues.push('Customer name must be 2–80 characters');
  const email = typeof raw.email === 'string' ? raw.email.trim() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) issues.push('Enter a valid email address');
  const id = typeof raw.productId === 'string' ? raw.productId : '';
  const product = Object.hasOwn(catalog, id) ? catalog[id] : null;
  if (!product || !Number.isSafeInteger(product.price) || product.price < 0) issues.push('Choose a valid product');
  const quantity = parseQuantity(raw.quantity);
  if (quantity === null) issues.push('Quantity must be an integer between 1 and 100');
  if (issues.length) throw new ValidationError('Please correct the highlighted fields', issues);
  const total = product.price * quantity;
  if (!Number.isSafeInteger(total)) throw new ValidationError('Total exceeds safe integer range', ['Calculation error']);
  return { customer, email, productId: id, productName: product.name, quantity, unitPrice: product.price, total };
}
export function formatBDT(amount) {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new TypeError('Invalid amount');
  return new Intl.NumberFormat('en-BD', {style:'currency',currency:'BDT',maximumFractionDigits:0}).format(amount);
}
