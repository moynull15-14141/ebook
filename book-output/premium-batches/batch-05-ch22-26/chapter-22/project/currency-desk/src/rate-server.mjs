import { createServer } from 'node:http';

// একটি স্থানীয় নকল Rate Provider (Test ও Demo-র জন্য; বাস্তব Provider নয়)।
// controls দিয়ে Test ইচ্ছামতো ব্যর্থতা তৈরি করতে পারে।
export function createRateServer(table) {
  const controls = { failNext: 0, failStatus: 503, requests: 0 };
  const server = createServer((req, res) => {
    controls.requests += 1;
    const pair = /^\/rates\/([A-Z]{3}-[A-Z]{3})$/.exec(req.url)?.[1];
    if (controls.failNext > 0) {
      controls.failNext -= 1;
      res.writeHead(controls.failStatus).end();
    } else if (pair && Object.hasOwn(table, pair)) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ pair, rateMicro: table[pair] }));
    } else {
      res.writeHead(404).end();
    }
  });
  return { server, controls };
}
