const trips = [
  { id: 'T1', ownerId: 1, place: 'Sylhet' },
  { id: 'T2', ownerId: 2, place: 'Cox' },
];

function readTrip(user, id) {
  if (!user) {
    return '401 Login প্রয়োজন';
  }
  const trip = trips.find((item) => item.id === id);
  if (!trip || (trip.ownerId !== user.id && user.role !== 'admin')) {
    return '404 পাওয়া যায়নি';
  }
  return `200 ${trip.place}`;
}

const rafi = { id: 1, role: 'customer' };
const admin = { id: 9, role: 'admin' };
console.log(readTrip(null, 'T1'));
console.log(['T1', 'T2', 'T9'].map((id) => readTrip(rafi, id)).join(' | '));
console.log(readTrip(admin, 'T2'));
