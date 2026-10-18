// Fee-র স্তর। from ও MAX_AMOUNT পয়সায়; bp = Basis Point (100 bp = 1%)।
// প্রতিটি স্তরের নিচের সীমা অন্তর্ভুক্ত। min এমনভাবে বাছা যে বড় পরিমাণে
// Fee কখনো কমে না (স্তরের সীমায় "লাফ" নেই)।
export const FEE_TIERS = Object.freeze([
  Object.freeze({ from: 1, bp: 200, min: 5_000 }),
  Object.freeze({ from: 100_000, bp: 150, min: 5_000 }),
  Object.freeze({ from: 1_000_000, bp: 100, min: 15_000 }),
]);

export const MAX_AMOUNT = 50_000_000;

export function feeFor(minor) {
  if (!Number.isSafeInteger(minor) || minor < 1) {
    throw new RangeError('পরিমাণ অন্তত 0.01 হতে হবে');
  }
  if (minor > MAX_AMOUNT) {
    throw new RangeError('এক লেনদেনে সর্বোচ্চ 500,000.00');
  }
  const tier = FEE_TIERS.findLast((t) => minor >= t.from);
  const percent = Number((BigInt(minor) * BigInt(tier.bp) + 5_000n) / 10_000n);
  return Math.max(tier.min, percent);
}
