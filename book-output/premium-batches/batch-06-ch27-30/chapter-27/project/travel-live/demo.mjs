// পুরো প্রবাহ এক Process-এ: Server চালু, দুই Client, HTTP দিয়ে অবস্থা-বদল।
import { createDemo } from './src/demo-data.mjs';
import { createLiveServer } from './src/server.mjs';
import { BookingView } from './src/client-state.mjs';
import { login } from './tests/helpers.mjs';

const { hub, users } = createDemo();
const { server } = createLiveServer({ hub, users, allowedOrigins: [] });
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const host = `127.0.0.1:${server.address().port}`;
const view = new BookingView();
const ack = (id) => (m) => m.type === 'ack' && m.requestId === id;

// নির্দিষ্ট Sequence পর্যন্ত অপেক্ষা, তারপর নতুন Event-গুলো ক্রমে প্রয়োগ।
async function applyUntil(client, sequence) {
  await client.next((m) => m.event?.sequence === sequence);
  for (const m of client.messages.splice(0)) {
    if (m.type !== 'event') continue;
    const result = view.apply(m.event);
    console.log(`  #${m.event.sequence} ${m.event.type}: ${result}`);
  }
}

async function rafiSubscribes(afterSequence) {
  const rafi = await login(host, 'token-rafi');
  rafi.send({ type: 'subscribe', bookingId: 'bk-1', requestId: 's',
    afterSequence });
  console.log('Rafi subscribe:', (await rafi.next(ack('s'))).mode);
  return rafi;
}

const changeStatus = (token, status) => fetch(
  `http://${host}/api/bookings/bk-1/status`, { method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }) }).then((res) => res.status);

const rafi = await rafiSubscribes(0);
await applyUntil(rafi, 1);
console.log('Agent CONFIRMED:', await changeStatus('token-agent', 'CONFIRMED'));
await applyUntil(rafi, 2);

const mina = await login(host, 'token-mina');
mina.send({ type: 'subscribe', bookingId: 'bk-1', requestId: 'm' });
console.log('Mina subscribe:', (await mina.next(ack('m'))).code);

rafi.socket.close();
await rafi.closed;
console.log('Rafi offline; Agent CANCELLED:',
  await changeStatus('token-agent', 'CANCELLED'));
const again = await rafiSubscribes(view.lastSequence('bk-1'));
await applyUntil(again, 3);
console.log('Rafi-র Screen:', view.get('bk-1'));

for (const client of [mina, again]) client.socket.close();
server.closeAllConnections();
server.close();
