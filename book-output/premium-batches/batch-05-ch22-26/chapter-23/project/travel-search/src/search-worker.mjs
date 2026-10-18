// Web Worker: আলাদা Thread-এ তথ্য তৈরি, Index ও খোঁজ। DOM-এ প্রবেশ নেই;
// Main Thread-এর সঙ্গে শুধু Message।
import { generateRecords } from './data.mjs';
import { buildIndex, indexedSearch } from './search.mjs';

performance.mark('index-start');
const index = buildIndex(generateRecords());
performance.mark('index-end');
const built = performance.measure('index', 'index-start', 'index-end');
postMessage({ type: 'ready', total: index.records.length, ms: built.duration });

addEventListener('message', ({ data }) => {
  const started = performance.now();
  const results = indexedSearch(index, data.query, data.options);
  postMessage({
    type: 'results',
    requestId: data.requestId,
    rows: results,
    ms: performance.now() - started,
  });
});
