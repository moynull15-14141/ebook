import { validateBooking } from '../project/travel-master-pro/src/validation.mjs';

// typeof দিয়ে যাচাই যথেষ্ট নয়: এগুলো সবই "number"।
const suspicious = [2, Number.NaN, Infinity, 1.5, -3, 0, 11, '2'];
for (const travelers of suspicious) {
  const naive = typeof travelers === 'number';
  let strict;
  try {
    validateBooking({ packageId: 'BT-4D', travelers,
      idempotencyKey: 'demo-key-0001' });
    strict = 'গ্রহণ';
  } catch (error) {
    strict = `বাতিল (${error.details.join(', ')})`;
  }
  const shown = typeof travelers === 'string' ? `'${travelers}'`
    : String(travelers);
  console.log(shown.padEnd(8), `typeof: ${naive}`.padEnd(14), strict);
}
