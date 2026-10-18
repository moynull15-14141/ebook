import { withExpress } from '../../project/visa-flow/src/domain/fees.mjs';

const transit = {
  label: 'Transit',
  maxTravelers: 4,
  fee: ({ travelers }) => 1200 * travelers,
};

const two = { travelers: 2 };
console.log(transit.fee(two), withExpress(transit).fee(two));
console.log(withExpress(transit).maxTravelers);
