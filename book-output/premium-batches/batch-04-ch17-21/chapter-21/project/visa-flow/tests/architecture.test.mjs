// Architecture Test: নির্ভরতার দিক Code-এ নিয়ম হিসেবে যাচাই।
// domain কিছুর ওপর নির্ভর করে না; app শুধু domain-এর ওপর; ui শুধু domain-এর ওপর;
// infra কোনো স্তরকে Import করে না; সব জোড়া লাগে শুধু main.mjs-এ।
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';

const SRC = resolve(import.meta.dirname, '../src');
const ALLOWED = {
  domain: ['domain'],
  app: ['domain', 'app'],
  ui: ['domain', 'ui'],
  infra: ['infra'],
};

function importsOf(file) {
  const text = readFileSync(file, 'utf8');
  return [...text.matchAll(/^import[^'"]*['"]([^'"]+)['"]/gm)].map((m) => m[1]);
}

const layerOf = (file) => relative(SRC, file).split(/[\\/]/)[0];

for (const [layer, allowed] of Object.entries(ALLOWED)) {
  test(`${layer} শুধু ${allowed.join(', ')}-এর ওপর নির্ভর করে`, () => {
    const dir = join(SRC, layer);
    for (const name of readdirSync(dir)) {
      const file = join(dir, name);
      for (const specifier of importsOf(file)) {
        assert.ok(specifier.startsWith('.'), `${name}: বাইরের Package ${specifier}`);
        const target = layerOf(resolve(dirname(file), specifier));
        assert.ok(allowed.includes(target), `${layer}/${name} Import করছে ${specifier}`);
      }
    }
  });
}

test('main.mjs (Composition Root) একাই infra ও ui জোড়ে', () => {
  const targets = importsOf(join(SRC, 'main.mjs'))
    .map((s) => layerOf(resolve(SRC, s)));
  assert.ok(targets.includes('infra') && targets.includes('ui') && targets.includes('app'));
});
