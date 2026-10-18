import { setIn } from '../../project/ledger-flow/src/immutable.mjs';

const diffShallow = (before, after) =>
  [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((key) => before[key] !== after[key]);

const state = { cart: { items: [1, 2] }, user: { name: 'Sara' }, theme: 'light' };
const next = setIn(state, ['cart', 'items'], [1, 2, 3]);

console.log(diffShallow(state, next));
console.log(diffShallow(state, setIn(state, ['theme'], 'light')));
