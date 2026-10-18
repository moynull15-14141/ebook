import { loadConfig } from '../../project/lead-desk/src/config.mjs';
import { startServer } from '../../project/lead-desk/src/server.mjs';

const token = 'reader-token-for-the-pagination-demo';
const config = loadConfig({ PORT: '0', API_TOKENS: `boss:manager:${token}` });
const server = await startServer(config);
const headers = {
  authorization: `Bearer ${token}`, 'content-type': 'application/json',
};
for (let i = 1; i <= 7; i += 1) {
  const body = JSON.stringify({
    name: `Guest ${i}`, phone: '01812345678',
    destination: 'Bandarban', travelers: i,
  });
  await fetch(`${server.url}/v1/leads`, { method: 'POST', headers, body });
}

const ids = [];
let after = '';
let pages = 0;
do {
  const page = await (await fetch(`${server.url}/v1/leads?limit=3&after=${after}`,
    { headers })).json();
  ids.push(...page.items.map((lead) => lead.id));
  after = page.next;
  pages += 1;
} while (after);
console.log(pages, ids.length, ids.at(-1));
await server.shutdown();
