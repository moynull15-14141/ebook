// @ts-check

/**
 * @param {number} price
 * @param {number} percent
 * @returns {number}
 */
export function discount(price, percent) {
  return Math.round(price * (1 - percent / 100));
}

/** @type {{ title: string, days: number }} */
const tour = { title: 'Sajek', days: '2' };
console.log(discount('500', 10), tour);
