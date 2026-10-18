import { startInventory } from './services/inventory.mjs';
import { startPayment } from './services/payment.mjs';
import { openSagaStore } from './saga-store.mjs';
import { createOrchestrator } from './orchestrator.mjs';

// পুরো ব্যবস্থা এক জায়গায় চালু: দুটি আলাদা HTTP Service (প্রত্যেকের নিজস্ব
// Port ও নিজস্ব Data) এবং একটি Orchestrator, যার নিজস্ব SQLite Log।
export async function startSystem({ seats = 10, dbPath = ':memory:',
  hooks, callOptions } = {}) {
  const inventory = await startInventory({ seats });
  const payment = await startPayment();
  const store = openSagaStore(dbPath);
  const orchestrator = createOrchestrator({ store, hooks, callOptions,
    inventoryUrl: inventory.url, paymentUrl: payment.url });
  const json = (url) => fetch(url).then((res) => res.json());
  return {
    inventory, payment, store, orchestrator,
    stock: () => json(`${inventory.url}/stock`),
    ledger: () => json(`${payment.url}/ledger`),
    async close() {
      await Promise.all([inventory.close(), payment.close()]);
      store.close();
    },
  };
}
