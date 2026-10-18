import http from 'node:http';
import WebSocketLib from 'ws';

// Server: 'ws' Package (npm install ws)। Client: Node.js 22-এর অন্তর্নির্মিত
// WebSocket, যা Browser-এর মতোই addEventListener ব্যবহার করে।
const server = http.createServer();
const wss = new WebSocketLib.Server({ server });
wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'welcome' }));
  socket.on('message', (data) => {
    const msg = JSON.parse(String(data));
    socket.send(JSON.stringify({ type: 'echo', text: msg.text }));
    socket.close(1000, 'done');
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

const ws = new WebSocket(`ws://127.0.0.1:${server.address().port}`);
console.log('শুরুতে readyState =', ws.readyState);
ws.addEventListener('open', () => console.log('open, readyState =',
  ws.readyState));
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  console.log('message:', msg);
  if (msg.type === 'welcome') ws.send(JSON.stringify({ text: 'হ্যালো' }));
});
ws.addEventListener('close', (event) => {
  console.log('close:', event.code, event.reason, 'clean =', event.wasClean);
  server.close();
});
