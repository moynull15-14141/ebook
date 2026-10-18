// HTTP দিয়ে পুরো Capstone-এর প্রতিটি নিয়ম, এক Process-এ (Memory Database)।
import { startServer } from './src/server.mjs';

const app = await startServer();
async function call(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${app.url}${path}`, { method, headers: {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(body && { 'Content-Type': 'application/json' }) },
  body: body && JSON.stringify(body) });
  const json = await res.json();
  return { status: res.status, ...json };
}
const show = (label, { status, data, error }) => {
  const detail = error?.code ?? `${data.status}, ${data.totalBdt} টাকা`;
  console.log(`${label}: ${status} ${detail}`);
};

const people = {};
for (const name of ['Rafi', 'Mina']) {
  const email = `${name.toLowerCase()}@example.com`;
  await call('/api/register', { method: 'POST',
    body: { name, email, password: 'long-password-123' } });
  people[name] = (await call('/api/login', { method: 'POST',
    body: { email, password: 'long-password-123' } })).data.token;
}

const order = { packageId: 'BT-4D', travelers: 2, price: 1,
  idempotencyKey: 'demo-key-0001' };
const book = (token, body) => call('/api/bookings', { method: 'POST',
  token, body });
const first = await book(people.Rafi, order);
show('১. Booking (Client price 1 পাঠিয়েছে)', first);
show('২. একই Key আবার', await book(people.Rafi, order));
show('৩. একই Key, ভিন্ন যাত্রী', await book(people.Rafi,
  { ...order, travelers: 3 }));
show('৪. Token ছাড়া', await book(undefined, order));
show('৫. SYL-2D-তে ৩ জন', await book(people.Rafi,
  { packageId: 'SYL-2D', travelers: 3, idempotencyKey: 'demo-key-0002' }));
const cancelPath = `/api/bookings/${first.data.id}/cancel`;
show('৬. Mina বাতিল করতে চান', await call(cancelPath,
  { method: 'PATCH', token: people.Mina }));
show('৭. Rafi বাতিল করেন', await call(cancelPath,
  { method: 'PATCH', token: people.Rafi }));
const seats = (await call('/api/packages')).data
  .find((p) => p.id === 'BT-4D').seats;
console.log('BT-4D-এ আসন:', seats);
await app.close();
