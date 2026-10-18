import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { MoneyError } from './money.mjs';

const PUBLIC = new URL('../public/', import.meta.url);
const STATIC = { '/': 'index.html', '/app.mjs': 'app.mjs' };
const TYPES = { html: 'text/html', mjs: 'text/javascript' };
const STATUS = { BAD_CURRENCY: 400, UNKNOWN_PAIR: 404 };

function send(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

// Error-এর ধরন থেকে HTTP Status: ব্যবহারকারীর ভুল 4xx, বাইরের সমস্যা 502।
function statusFor(error) {
  if (error instanceof MoneyError || error instanceof RangeError) {
    return 400;
  }
  return STATUS[error.code] ?? (error.name === 'RateError' ? 502 : 500);
}

export function createApi({ quotes }) {
  return createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && Object.hasOwn(STATIC, req.url)) {
        const file = STATIC[req.url];
        const type = TYPES[file.split('.').pop()];
        res.writeHead(200, { 'content-type': `${type}; charset=utf-8` });
        res.end(await readFile(new URL(file, PUBLIC)));
      } else if (req.method === 'POST' && req.url === '/api/quotes') {
        let body = '';
        for await (const chunk of req) {
          body += chunk;
        }
        send(res, 201, await quotes.quote(JSON.parse(body || '{}')));
      } else {
        send(res, 404, { error: 'পাওয়া যায়নি' });
      }
    } catch (error) {
      const status = error instanceof SyntaxError ? 400 : statusFor(error);
      const message = status === 500 ? 'Server-এ সমস্যা' : error.message;
      send(res, status, { error: message, code: error.code ?? null });
    }
  });
}
