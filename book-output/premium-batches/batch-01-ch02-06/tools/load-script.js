// Loads a plain (non-module) project script for testing: runs it in an isolated context with a captured
// console. `fn` holds its function declarations; `get(name)` also reaches top-level const/let (arrow functions);
// `printed` is everything the script logged.
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');

module.exports = function loadScript(file) {
  const printed = [];
  const context = vm.createContext({ console: { log: (...args) => printed.push(args.join(' ')) } });
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  return { fn: context, get: name => vm.runInContext(name, context), printed };
};
