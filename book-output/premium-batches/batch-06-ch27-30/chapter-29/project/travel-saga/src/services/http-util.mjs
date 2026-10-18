import http from 'node:http';

// ছোট JSON Server: প্রতিটি Service নিজের Route-গুলো একটি Function-এ দেয়।
export async function serveJson(route) {
  const server = http.createServer(async (req, res) => {
    let body = {};
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (chunks.length) body = JSON.parse(Buffer.concat(chunks).toString());
      const { pathname } = new URL(req.url, 'http://localhost');
      const [status, data, delayMs = 0] = await route(req.method,
        pathname.split('/').filter(Boolean), body);
      if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'BAD_REQUEST' }));
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const close = () => new Promise((resolve) => {
    server.closeAllConnections();
    server.close(resolve);
  });
  return { url, close };
}
