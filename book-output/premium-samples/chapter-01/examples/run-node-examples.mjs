// অধ্যায়ের Node.js উদাহরণগুলো চালিয়ে আসল Output দেখায়।
// চালানোর Command:  node examples/run-node-examples.mjs
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let unexpected = 0;
for (const [dir, shouldFail] of [['node', false], ['solutions/node', false], ['errors', true]]) {
  for (const file of fs.readdirSync(path.join(HERE, dir)).sort()) {
    const r = spawnSync(process.execPath, [file], { cwd: path.join(HERE, dir), encoding: 'utf8' });
    const failed = r.status !== 0;
    if (failed !== shouldFail) unexpected++;
    console.log(`===== ${dir}/${file}  (exit code ${r.status}${failed === shouldFail ? '' : ' — UNEXPECTED'}) =====`);
    const text = (r.stdout + r.stderr).replaceAll(path.join(HERE, dir) + path.sep, '').replaceAll(pathToPosix(path.join(HERE, dir)) + '/', '');
    console.log(text.trimEnd() + '\n');
  }
}
function pathToPosix(p) { return 'file:///' + p.split(path.sep).join('/'); }
console.log(unexpected ? `${unexpected} টি উদাহরণের ফল প্রত্যাশার সঙ্গে মেলেনি।` : 'সব উদাহরণ প্রত্যাশা অনুযায়ী চলেছে (errors/ Folder-এর File-গুলোতে Error হওয়াই প্রত্যাশিত)।');
process.exit(unexpected ? 1 : 0);
