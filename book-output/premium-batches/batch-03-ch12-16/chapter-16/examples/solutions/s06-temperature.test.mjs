import { test } from 'node:test';
import assert from 'node:assert/strict';

async function getTemperature(city, fetchImpl = fetch) {
  const response = await fetchImpl(`/weather?city=${encodeURIComponent(city)}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()).celsius;
}

const stubFetch = (status, body) => async () =>
  new Response(JSON.stringify(body), { status });

test('সফল সাড়ায় তাপমাত্রা', async () => {
  const celsius = await getTemperature('Dhaka', stubFetch(200, { celsius: 31 }));
  assert.equal(celsius, 31);
});

test('404-এ ত্রুটি', async () => {
  const result = getTemperature('Atlantis', stubFetch(404, {}));
  await assert.rejects(result, { message: 'HTTP 404' });
});
