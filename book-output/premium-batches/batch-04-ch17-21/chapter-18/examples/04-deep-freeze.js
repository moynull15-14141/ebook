'use strict';

function deepFreeze(value) {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

const config = deepFreeze({ tax: { rate: 15 }, regions: ['Dhaka', 'Sylhet'] });

try {
  config.tax.rate = 0;
} catch (error) {
  console.log(error.name);
}
try {
  config.regions.push('Khulna');
} catch (error) {
  console.log(error.name);
}
console.log(config.tax.rate, config.regions.length);
