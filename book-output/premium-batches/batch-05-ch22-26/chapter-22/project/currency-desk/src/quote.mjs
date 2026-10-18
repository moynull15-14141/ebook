import { parseAmount, convert } from './money.mjs';
import { feeFor } from './fees.mjs';

// একটি Quote: কত পাঠাবেন, Fee, মোট দেবেন, কত পাবেন, এবং কতক্ষণ বৈধ।
export function createQuoteService(deps) {
  const { rates, newId, now = Date.now, validityMs = 60_000 } = deps;

  async function quote({ from, to, amount }) {
    const minor = parseAmount(amount);
    const fee = feeFor(minor);
    const rateMicro = await rates.getRate(from, to);
    return {
      id: newId(),
      from,
      to,
      amount: minor,
      fee,
      payable: minor + fee,
      receives: convert(minor, rateMicro),
      rateMicro,
      expiresAt: now() + validityMs,
    };
  }

  const isValid = (q) => now() < q.expiresAt;
  return { quote, isValid };
}
