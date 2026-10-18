import { createServer } from 'node:http';
import { createApp } from './app.mjs';
import { createLeadService } from './service.mjs';
import { createLeadRepository } from './repository.mjs';

// সব অংশ জোড়া লাগিয়ে Server চালু; shutdown() নতুন সংযোগ বন্ধ করে,
// চলমান অনুরোধ শেষ হতে দেয়, এবং সময়সীমার পরে বাকি সংযোগ কেটে দেয়।
export async function startServer(config, { log = () => {}, service } = {}) {
  const state = { ready: true };
  const leads = service
    ?? createLeadService({ repository: createLeadRepository() });
  const app = createApp({ config, service: leads, log, state });
  const server = createServer(app);
  await new Promise((resolve) => {
    server.listen(config.port, config.host, resolve);
  });

  let closing = null;
  function shutdown() {
    closing ??= new Promise((resolve) => {
      state.ready = false;
      server.close(resolve);
      server.closeIdleConnections();
      const force = () => server.closeAllConnections();
      setTimeout(force, config.shutdownGraceMs).unref();
    });
    return closing;
  }

  const { port } = server.address();
  return { url: `http://${config.host}:${port}`, shutdown, state };
}
