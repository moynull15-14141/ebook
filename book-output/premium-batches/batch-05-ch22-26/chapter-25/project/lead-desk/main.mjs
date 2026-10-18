import { loadConfig, demoTokens } from './src/config.mjs';
import { startServer } from './src/server.mjs';

// API_TOKENS না দিলে Demo-র জন্য প্রতি চালানোয় নতুন Token (শুধু এই Terminal-এ দেখায়)।
let env = process.env;
if (!env.API_TOKENS) {
  const t = demoTokens();
  const tokens = [`manager:manager:${t.manager}`, `rafi:agent:${t.rafi}`,
    `mina:agent:${t.mina}`];
  env = { ...env, API_TOKENS: tokens.join(',') };
  console.log(`Demo Token (manager): ${t.manager}`);
  console.log(`Demo Token (rafi):    ${t.rafi}`);
  console.log(`Demo Token (mina):    ${t.mina}`);
}

const config = loadConfig(env);
const log = (entry) => console.log(JSON.stringify(entry));
const server = await startServer(config, { log });
console.log(`LeadDesk API (শিক্ষামূলক Demo, শুধু এই কম্পিউটারে): ${server.url}`);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    console.log(`${signal}: নতুন অনুরোধ বন্ধ, চলমান অনুরোধ শেষ হওয়ার অপেক্ষা...`);
    await server.shutdown();
    console.log('বন্ধ হয়েছে।');
    process.exit(0);
  });
}
