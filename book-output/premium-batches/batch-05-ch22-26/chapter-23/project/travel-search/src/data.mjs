// ১২,০০০টি কাল্পনিক ভ্রমণ-প্যাকেজ, Seed থেকে: প্রতিবার হুবহু একই তথ্য।
const PLACES = ['Dhaka', 'Sylhet', 'Bandarban', 'Rangamati', 'Khulna',
  'Kuakata', 'Srimangal', 'Rajshahi', 'Bogura', 'Saint Martin',
  'Kathmandu', 'Darjeeling', 'Bangkok', 'Kuala Lumpur', 'Dubai'];
const KINDS = ['Hotel', 'Resort', 'Tour', 'Cruise', 'Homestay'];
const WORDS = ['River', 'Hill', 'Lake', 'Garden', 'Sea', 'Tea', 'Royal',
  'Green', 'Golden', 'Silent'];

export function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateRecords(count = 12_000, seed = 23) {
  const random = createRandom(seed);
  const pick = (list) => list[Math.floor(random() * list.length)];
  return Array.from({ length: count }, (_, i) => {
    const place = pick(PLACES);
    const kind = pick(KINDS);
    return {
      id: i + 1,
      title: `${pick(WORDS)} ${pick(WORDS)} ${kind}`,
      place,
      kind,
      price: 1_500 + Math.floor(random() * 60) * 500,
      rating: Math.round((3 + random() * 2) * 10) / 10,
    };
  });
}
