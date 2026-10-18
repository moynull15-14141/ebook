import { WORKFLOW } from '../../project/visa-flow/src/domain/workflow.mjs';

const lines = Object.entries(WORKFLOW).flatMap(([from, moves]) =>
  Object.entries(moves).map(([action, to]) => `  ${from} --${action}--> ${to}`));

console.log('stateDiagram');
console.log(lines.join('\n'));
