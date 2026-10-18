// পরীক্ষার জন্য নিয়ন্ত্রিত Local Server: Project-এর File দেয়, এবং /api/users-এ Test যা বলে সেই সাড়া দেয়।
// Internet বা কোনো Public API লাগে না, তাই প্রতিবার একই ফল।
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

const SAMPLE_USERS = [
  { id: 1, name: 'Sara Ahmed', email: 'sara@example.com', address: { city: 'Dhaka' } },
  { id: 2, name: 'Rafi Khan', email: 'rafi@example.com', address: { city: 'Bogura' } },
  { id: 3, name: 'Mina Das', email: 'mina@example.com', address: { city: 'Sylhet' } },
];

// reply({ status, body, delayMs }) পরের /api/users Request-এর সাড়া ঠিক করে; কিছু না বললে 200 এবং SAMPLE_USERS।
function startServer(root = path.join(__dirname, '..')) {
  const queue = [];
  const state = { hits: 0 };

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/api/users') {
      state.hits += 1;
      const reply = queue.shift() ?? {};
      const body = reply.body ?? SAMPLE_USERS;
      const timer = setTimeout(() => {
        res.writeHead(reply.status ?? 200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(typeof body === 'string' ? body : JSON.stringify(body));
      }, reply.delayMs ?? 0);
      res.on('close', () => clearTimeout(timer));
      return;
    }

    const file = path.join(root, path.normalize(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({
      url: `http://127.0.0.1:${server.address().port}`,
      state,
      reply: (...replies) => queue.push(...replies),
      close: () => new Promise((done) => { server.closeAllConnections(); server.close(done); }),
    }));
  });
}

module.exports = { startServer, SAMPLE_USERS };
