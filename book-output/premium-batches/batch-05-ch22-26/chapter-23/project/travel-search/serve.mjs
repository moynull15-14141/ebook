// Project Folder-এর ছোট Static Server (শুধু 127.0.0.1)। Module Worker
// file:// থেকে চলে না, তাই একটি HTTP Server লাগে।
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

export function startStatic(port = 0) {
  const server = createServer(async (req, res) => {
    const path = new URL(req.url, 'http://x').pathname;
    const file = normalize(join(ROOT, path === '/' ? 'index.html' : path));
    const type = TYPES[extname(file)];
    if (!file.startsWith(ROOT) || !type) {
      res.writeHead(404).end();
      return;
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': type }).end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((done) => {
    server.listen(port, '127.0.0.1', () => {
      done({ server, url: `http://127.0.0.1:${server.address().port}/` });
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { url } = await startStatic(Number(process.env.PORT ?? 8023));
  console.log(`TravelSearch Explorer: ${url}  (বন্ধ করতে Ctrl+C)`);
}
