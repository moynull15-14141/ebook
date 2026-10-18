import { loadConfig, describeConfig } from './src/config.mjs';
import { createLogger } from './src/logger.mjs';
import { createMetrics } from './src/metrics.mjs';
import { createMemoryJobStore } from './src/jobs.mjs';
import { startServer } from './src/server.mjs';

let config;
try {
  config = loadConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1); // ভুল Config নিয়ে কখনো চালু নয়
}

const logger = createLogger({ level: config.logLevel,
  base: { service: 'deploy-ready', version: config.version } });
logger.info('config.loaded', describeConfig(config));
const { shutdown } = await startServer({ config, logger,
  metrics: createMetrics(), store: createMemoryJobStore() });

// Container Platform বন্ধ করার আগে SIGTERM পাঠায়; Ctrl+C পাঠায় SIGINT।
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, async () => {
    const { forced } = await shutdown(signal);
    process.exit(forced ? 1 : 0);
  });
}
process.on('unhandledRejection', async (reason) => {
  logger.error('process.unhandledRejection', { message: String(reason) });
  await shutdown('unhandledRejection');
  process.exit(1);
});
