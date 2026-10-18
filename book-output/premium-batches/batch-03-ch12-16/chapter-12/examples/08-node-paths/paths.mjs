import path from 'node:path';

console.log(path.basename(import.meta.dirname));
console.log(path.basename(import.meta.filename));
console.log(typeof require, typeof __dirname);
