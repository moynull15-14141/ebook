import { createDemo } from '../src/demo-data.mjs';
import { createLiveServer } from '../src/server.mjs';

export const ORIGIN = 'http://localhost:3027';

export async function startServer(options = {}) {
  const { hub, users } = createDemo();
  const { server, gateway } = createLiveServer({ hub, users,
    allowedOrigins: [ORIGIN], ...options });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const host = `127.0.0.1:${server.address().port}`;
  const close = () => new Promise((resolve) => {
    for (const ws of gateway.wss.clients) ws.terminate();
    server.closeAllConnections();
    server.close(resolve);
  });
  return { hub, server, gateway, host, close };
}

// Node.js 22-এর অন্তর্নির্মিত WebSocket Client; প্রতিটি Message জমা রাখে।
export function openClient(host) {
  const socket = new WebSocket(`ws://${host}/live`);
  const messages = [];
  const waiters = [];
  socket.addEventListener('message', ({ data }) => {
    const msg = JSON.parse(data);
    messages.push(msg);
    for (const w of [...waiters]) {
      if (w.match(msg)) waiters.splice(waiters.indexOf(w), 1)[0].resolve(msg);
    }
  });
  const opened = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  const closed = new Promise((resolve) => socket.addEventListener('close',
    ({ code, reason }) => resolve({ code, reason }), { once: true }));
  const next = (match) => new Promise((resolve) => {
    const found = messages.find(match);
    if (found) resolve(found);
    else waiters.push({ match, resolve });
  });
  const send = (msg) => socket.send(JSON.stringify(msg));
  return { socket, messages, opened, closed, next, send };
}

export async function login(host, token) {
  const client = openClient(host);
  await client.opened;
  client.send({ type: 'auth', token });
  await client.next((m) => m.type === 'auth.ok');
  return client;
}

export async function api(host, path, { token, method = 'GET', body } = {}) {
  const res = await fetch(`http://${host}${path}`, { method,
    headers: { ...(token && { Authorization: `Bearer ${token}` }),
      'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
}
