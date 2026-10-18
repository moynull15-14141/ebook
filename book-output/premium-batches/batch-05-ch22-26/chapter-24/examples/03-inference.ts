let seats = 40;
const mode = 'bus';

type Mode = 'bus' | 'train' | 'air';
function fare(travelMode: Mode, km: number): number {
  const perKm = { bus: 2, train: 1.5, air: 9 }[travelMode];
  return Math.round(perKm * km);
}

seats = 'forty';
console.log(fare(mode, 220), fare('ship', 100));
