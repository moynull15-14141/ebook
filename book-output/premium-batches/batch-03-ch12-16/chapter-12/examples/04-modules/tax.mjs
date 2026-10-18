export const VAT_RATE = 0.15;

export function withVat(price) {
  return Math.round(price * (1 + VAT_RATE));
}
