import { updateIn } from '../../project/ledger-flow/src/immutable.mjs';

const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
const doubled = updateIn(matrix, [1, 2], (value) => value * 2);

console.log(doubled[1], matrix[1]);
const same = [0, 1, 2].map((row) => doubled[row] === matrix[row]);
console.log(same.join(' '));
