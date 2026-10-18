const CONFIG = {
  currency: 'BDT',
  limits: { hotelPerNight: 8_000, mealPerPerson: 1_000 },
  modes: ['bus', 'train', 'air'],
} as const;

type TravelMode = (typeof CONFIG.modes)[number];
const mode: TravelMode = 'air';

console.log(mode, CONFIG.limits.hotelPerNight);
CONFIG.limits.hotelPerNight = 20_000;
CONFIG.modes.push('ship');
