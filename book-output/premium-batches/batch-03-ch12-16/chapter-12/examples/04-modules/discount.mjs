export function withDiscount(price, percent) {
  return Math.round(price * (1 - percent / 100));
}

export default function describe(price) {
  return `${price.toLocaleString('en-US')} টাকা`;
}
