import WebSocket from 'ws';
import { createBucket } from './rate-limit.mjs';

const CLOSE = { AUTH: 4401, FORBIDDEN_ORIGIN: 4403, RATE: 4429 };

// HTTP Server-এর 'upgrade' Event-এ WebSocket Gateway যুক্ত করে।
export function attachGateway(server, { hub, users, allowedOrigins,
  heartbeatMs = 30_000, authTimeoutMs = 3_000, maxBuffered = 64 * 1024 }) {
  const wss = new WebSocket.Server({ noServer: true, maxPayload: 4 * 1024 });
  const metrics = { connections: 0, rejectedOrigins: 0, slowConsumers: 0,
    protocolErrors: 0 };

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    const origin = req.headers.origin;
    if (pathname !== '/live') return socket.destroy();
    // Browser সব সময় Origin পাঠায়; অচেনা Site-এর Page-কে ঢুকতে দেবেন না।
    if (origin && !allowedOrigins.includes(origin)) {
      metrics.rejectedOrigins += 1;
      socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');
      return undefined;
    }
    return wss.handleUpgrade(req, socket, head,
      (ws) => wss.emit('connection', ws));
  });

  wss.on('connection', (ws) => {
    metrics.connections += 1;
    const conn = { ws, user: null, subs: new Map(),
      take: createBucket({ capacity: 20, refillPerSecond: 5 }) };
    const authTimer = setTimeout(
      () => ws.close(CLOSE.AUTH, 'auth timeout'), authTimeoutMs);
    ws.on('message', (data) => {
      if (!conn.take()) return ws.close(CLOSE.RATE, 'rate limit');
      return handleMessage(conn, String(data), { hub, users, authTimer,
        send: (msg) => send(conn, msg) });
    });
    // ভুল Frame বা সীমা-ছাড়ানো Message-এ 'error'; ws নিজেই পরে বন্ধ করে।
    // Handler না থাকলে পুরো Process ভেঙে পড়ত।
    ws.on('error', () => { metrics.protocolErrors += 1; });
    ws.on('close', () => {
      clearTimeout(authTimer);
      for (const unsubscribe of conn.subs.values()) unsubscribe();
      metrics.connections -= 1;
    });
  });

  // Slow Client: Buffer সীমা ছাড়ালে Connection বন্ধ; Client পরে Replay চাইবে।
  function send(conn, message) {
    if (conn.ws.readyState !== WebSocket.OPEN) return;
    if (conn.ws.bufferedAmount > maxBuffered) {
      metrics.slowConsumers += 1;
      conn.ws.terminate();
      return;
    }
    conn.ws.send(JSON.stringify(message));
  }

  // Heartbeat: আগের Ping-এর Pong না এলে Connection মৃত ধরে নিন।
  const timer = setInterval(() => {
    for (const ws of wss.clients) {
      if (ws.isAlive === false) { ws.terminate(); continue; }
      ws.isAlive = false;
      ws.ping();
    }
  }, heartbeatMs);
  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
  });
  server.on('close', () => clearInterval(timer));

  return { wss, metrics };
}

function handleMessage(conn, text, { hub, users, authTimer, send }) {
  let msg;
  try {
    msg = JSON.parse(text);
  } catch {
    return send({ type: 'error', code: 'BAD_JSON' });
  }
  if (msg.type === 'auth') {
    const user = users.get(msg.token);
    if (!user) return conn.ws.close(CLOSE.AUTH, 'invalid token');
    clearTimeout(authTimer);
    conn.user = user;
    return send({ type: 'auth.ok', userId: user.id });
  }
  if (!conn.user) return conn.ws.close(CLOSE.AUTH, 'auth required');
  if (msg.type === 'subscribe') return subscribe(conn, msg, hub, send);
  if (msg.type === 'unsubscribe') {
    conn.subs.get(msg.bookingId)?.();
    conn.subs.delete(msg.bookingId);
    return send({ type: 'ack', requestId: msg.requestId, ok: true });
  }
  return send({ type: 'error', code: 'UNKNOWN_TYPE' });
}

function subscribe(conn, msg, hub, send) {
  const { bookingId, requestId } = msg;
  const afterSequence = Number.isInteger(msg.afterSequence)
    ? msg.afterSequence : 0;
  if (typeof bookingId !== 'string' || conn.subs.has(bookingId)) {
    return send({ type: 'ack', requestId, ok: false, code: 'BAD_REQUEST' });
  }
  try {
    const result = hub.subscribe(conn.user.id, bookingId,
      (event) => send({ type: 'event', event }),
      { afterSequence, onClose: (reason) => {
        conn.subs.delete(bookingId);
        send({ type: 'unsubscribed', bookingId, reason });
      } });
    conn.subs.set(bookingId, result.unsubscribe);
    send({ type: 'ack', requestId, ok: true, mode: result.mode });
    if (result.mode === 'snapshot') {
      return send({ type: 'snapshot', snapshot: result.snapshot });
    }
    for (const event of result.events) send({ type: 'event', event });
    return undefined;
  } catch (error) {
    return send({ type: 'ack', requestId, ok: false, code: error.code });
  }
}
