import { createServer } from 'node:http';
import { createApp } from './app.mjs';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid PORT');
const app = createApp();
const server = createServer(app.handler);
server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.listen(port, '0.0.0.0', () => console.log(JSON.stringify({ event: 'listening', port: server.address().port })));
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(JSON.stringify({ event: 'shutdown', signal }));
  app.drain();
  server.close(err => { if (err) console.error(err); process.exitCode = err ? 1 : 0; });
  setTimeout(() => { console.error('Shutdown deadline exceeded'); process.exit(1); }, 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
