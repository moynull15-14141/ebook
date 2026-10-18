// Docker ছাড়াই Deploy File-এর সাধারণ ভুল ধরা (CI-তে Build-এর আগে)।
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url),
  'utf8');
const problems = [];
const rule = (ok, message) => { if (!ok) problems.push(message); };

// Dockerfile: '\' দিয়ে ভাঙা Line জোড়া লাগিয়ে প্রতিটি Instruction আলাদা।
const steps = read('Dockerfile').replace(/\\\n/g, ' ').split('\n')
  .map((line) => line.trim()).filter((line) => line && !line.startsWith('#'))
  .map((line) => {
    const [op, ...rest] = line.split(/\s+/);
    return { op: op.toUpperCase(), args: rest.join(' ') };
  });
const find = (op) => steps.filter((s) => s.op === op);
const index = (op) => steps.findIndex((s) => s.op === op);

rule(find('FROM').length > 0 && !/:latest\b/.test(find('FROM')[0].args)
  && /:/.test(find('FROM')[0].args), 'FROM-এ নির্দিষ্ট Tag বা Digest');
rule(find('USER').some((s) => !/^(root|0)$/.test(s.args)),
  'USER: root ছাড়া অন্য ব্যবহারকারী');
rule(index('USER') !== -1 && index('USER') < index('CMD'),
  'USER থাকতে হবে CMD-এর আগে');
rule(find('CMD').at(-1)?.args.startsWith('['), 'CMD Exec Form-এ (JSON Array)');
rule(!/npm/.test(find('CMD').at(-1)?.args ?? ''), 'CMD-এ npm নয়, সরাসরি node');
rule(find('HEALTHCHECK').length === 1, 'একটি HEALTHCHECK');
rule(!steps.some((s) => ['ENV', 'ARG'].includes(s.op)
  && /(SECRET|TOKEN|PASSWORD|KEY)\s*=/i.test(s.args)),
  'ENV বা ARG-এ কোনো গোপন মান নয়');
rule(!find('COPY').some((s) => /^\.\s+\.$/.test(s.args.replace(/--\S+\s*/g, ''))),
  'COPY . . নয়; শুধু প্রয়োজনীয় File');

const ignore = read('.dockerignore').split('\n').map((l) => l.trim());
for (const entry of ['node_modules', '.git', '.env']) {
  rule(ignore.includes(entry), `.dockerignore-এ ${entry}`);
}

const compose = read('compose.yaml');
rule(/"127\.0\.0\.1:\d+:\d+"/.test(compose), 'Compose Port শুধু 127.0.0.1-এ');
rule(/stop_grace_period:/.test(compose), 'Compose-এ stop_grace_period');
rule(!/OPS_TOKEN:/.test(compose), 'Compose File-এ Token-এর মান নয়');

for (const p of problems) console.log(`FAIL ${p}`);
console.log(`Instruction: ${steps.length}, সমস্যা: ${problems.length}`);
process.exit(problems.length ? 1 : 0);
