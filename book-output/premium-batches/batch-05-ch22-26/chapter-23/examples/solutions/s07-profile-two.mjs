import { Session } from 'node:inspector/promises';
import { topFunctions } from '../../project/travel-search/src/profile-report.mjs';

function heavy() {
  let total = 0;
  for (let i = 0; i < 3e7; i += 1) {
    total += Math.sqrt(i);
  }
  return total;
}

function light() {
  return Array.from({ length: 1_000 }, (_, i) => i).reduce((a, b) => a + b, 0);
}

const session = new Session();
session.connect();
await session.post('Profiler.enable');
await session.post('Profiler.start');
heavy();
light();
const { profile } = await session.post('Profiler.stop');
const [top] = topFunctions(profile, 1);
console.log(top.name.startsWith('heavy'));
