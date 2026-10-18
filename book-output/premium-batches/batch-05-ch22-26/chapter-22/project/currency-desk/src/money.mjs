// টাকা সব সময় পূর্ণসংখ্যায় (Minor Unit: পয়সা বা সেন্ট)। 0.1 + 0.2-এর মতো
// Floating-point ভুল এখানে ঢোকে না।
const AMOUNT = /^(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?$/;

export class MoneyError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MoneyError';
  }
}

// "1,234.5" থেকে 123450। কমা শুধু সঠিক তিন অঙ্কের দলে।
export function parseAmount(text) {
  const clean = String(text ?? '').trim();
  if (!AMOUNT.test(clean)) {
    throw new MoneyError(`অবৈধ পরিমাণ: "${clean}"`);
  }
  const [whole, fraction = ''] = clean.replaceAll(',', '').split('.');
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(minor)) {
    throw new MoneyError('পরিমাণ খুব বড়');
  }
  return minor;
}

export function formatAmount(minor, currency) {
  const sign = minor < 0 ? '-' : '';
  const abs = Math.abs(minor);
  const whole = Math.floor(abs / 100).toLocaleString('en-US');
  return `${sign}${whole}.${String(abs % 100).padStart(2, '0')} ${currency}`;
}

// হার Micro Unit-এ (1 = 0.000001)। গুণফল BigInt-এ, অর্ধেক হলে ওপরে।
export function convert(minor, rateMicro) {
  const scaled = BigInt(minor) * BigInt(rateMicro) + 500_000n;
  return Number(scaled / 1_000_000n);
}
