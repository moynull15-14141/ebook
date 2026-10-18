export function formatAmount(minor, currency) {
  const whole = Math.floor(minor / 100).toLocaleString('en-US');
  const cents = String(minor % 100).padStart(2, '0');
  return `${whole}.${cents} ${currency}`;
}
