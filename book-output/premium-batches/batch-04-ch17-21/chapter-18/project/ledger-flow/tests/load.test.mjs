// Batch Loader-এর Test: নিয়ন্ত্রিত Loader দিয়ে সর্বোচ্চ Concurrency, ক্রম ও আংশিক ব্যর্থতা।
// চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadInBatches } from '../src/load.mjs';
import { sampleLoader } from '../data/sample.mjs';

function trackingLoader(failing = []) {
  const state = { active: 0, peak: 0, started: [] };
  const loader = async (name) => {
    state.active += 1;
    state.peak = Math.max(state.peak, state.active);
    state.started.push(name);
    await new Promise((resolve) => setTimeout(resolve, 5));
    state.active -= 1;
    if (failing.includes(name)) {
      throw new Error('ভাঙা');
    }
    return [`${name}-1`, `${name}-2`];
  };
  return { loader, state };
}

test('সর্বোচ্চ batchSize একসঙ্গে; সব ফল নামের ক্রমে', async () => {
  const { loader, state } = trackingLoader();
  const result = await loadInBatches(['a', 'b', 'c', 'd', 'e'], loader, 2);
  assert.equal(state.peak, 2);
  assert.deepEqual(result.records, ['a-1', 'a-2', 'b-1', 'b-2', 'c-1', 'c-2', 'd-1', 'd-2', 'e-1', 'e-2']);
  assert.deepEqual(result.failures, []);
});

test('একটি File ব্যর্থ হলেও বাকিগুলো আসে; ব্যর্থতা নামসহ', async () => {
  const { loader } = trackingLoader(['b']);
  const result = await loadInBatches(['a', 'b', 'c'], loader, 2);
  assert.deepEqual(result.records, ['a-1', 'a-2', 'c-1', 'c-2']);
  assert.deepEqual(result.failures, ['b: ভাঙা']);
});

test('batchSize 1 মানে ক্রমে; batchSize বড় হলে সব একসঙ্গে', async () => {
  const one = trackingLoader();
  await loadInBatches(['a', 'b', 'c'], one.loader, 1);
  assert.equal(one.state.peak, 1);
  const all = trackingLoader();
  await loadInBatches(['a', 'b', 'c'], all.loader, 10);
  assert.equal(all.state.peak, 3);
});

test('নমুনা Loader: Copy ফেরত দেয় (ভেতরের তথ্য বদলায় না); অজানা মাসে ব্যর্থ', async () => {
  const first = await sampleLoader('2026-01');
  first[0].id = 'বদলানো';
  assert.equal((await sampleLoader('2026-01'))[0].id, 'O1');
  await assert.rejects(sampleLoader('2026-12'), /File নেই/);
});
