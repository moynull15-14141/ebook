import { createRateServer } from './rate-server.mjs';
import { createRateClient } from './rates.mjs';
import { createQuoteService } from './quote.mjs';
import { createApi } from './api.mjs';

export const SAMPLE_RATES = Object.freeze({
  'USD-BDT': 121_450_000,
  'BDT-USD': 8_234,
  'EUR-BDT': 131_900_000,
  'SAR-BDT': 32_380_000,
});

const listen = (server) => new Promise((resolve) => {
  server.listen(0, '127.0.0.1', () => resolve(server.address().port));
});

// দুটি স্থানীয় Server (নকল Rate Provider ও Quote API), এলোমেলো Port-এ।
export async function startDesk({ table = SAMPLE_RATES, retries = 2 } = {}) {
  const provider = createRateServer(table);
  const ratePort = await listen(provider.server);
  let counter = 0;
  const rates = createRateClient({
    baseUrl: `http://127.0.0.1:${ratePort}`, retries, sleep: async () => {},
  });
  const quotes = createQuoteService({
    rates, newId: () => `Q-${String(++counter).padStart(4, '0')}`,
  });
  const api = createApi({ quotes });
  const apiPort = await listen(api);
  const close = () => Promise.all([provider.server, api].map((s) =>
    new Promise((resolve) => s.close(resolve))));
  return { url: `http://127.0.0.1:${apiPort}`, provider, close };
}
