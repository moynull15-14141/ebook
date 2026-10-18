import http from 'node:http';
import { setTimeout as sleep } from 'node:timers/promises';
import { createApp } from './app.mjs';

// HTTP Server-এর জীবনচক্র: চালু করা এবং সুশৃঙ্খলভাবে বন্ধ করা।
export async function startServer({ config, logger, metrics, store }) {
  const app = createApp({ config, logger, metrics, store });
  const server = http.createServer(app.handle);
  server.keepAliveTimeout = 5_000;
  server.headersTimeout = 10_000;
  server.requestTimeout = 30_000;
  await new Promise((resolve) => server.listen(config.port, resolve));
  const { port } = server.address();
  logger.info('server.started', { port, version: config.version,
    commit: config.commit });

  let closing;
  // ১) Readiness 503, ২) Load Balancer-এর জন্য অপেক্ষা, ৩) নতুন সংযোগ বন্ধ,
  // ৪) চলমান অনুরোধ শেষ হতে দেওয়া, ৫) সময় পেরোলে জোর করে বন্ধ।
  function shutdown(reason) {
    closing ??= (async () => {
      app.state.draining = true;
      logger.info('shutdown.started', { reason,
        inFlight: app.state.inFlight });
      await sleep(config.drainDelayMs);
      let forced = false;
      const closed = new Promise((resolve) => server.close(resolve));
      server.closeIdleConnections();
      const timer = setTimeout(() => {
        forced = true;
        server.closeAllConnections();
      }, config.shutdownTimeoutMs);
      await closed;
      clearTimeout(timer);
      logger.info('shutdown.complete', { forced });
      return { forced };
    })();
    return closing;
  }

  return { server, port, app, shutdown };
}
