// Loads a plain (non-module) project script for testing: runs it in an isolated context with a captured console.
// `fn` holds its function declarations; `get(name)` also reaches top-level const/let/class; `printed` is everything
// it logged. `globals` adds extra names to the context (for example setTimeout, or a fake fetch).
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');

module.exports = function loadScript(file, globals = {}) {
  const printed = [];
  const log = (...args) => printed.push(args.join(' '));
  const context = vm.createContext({ console: { log, error: log, warn: log }, ...globals });
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  return { fn: context, get: name => vm.runInContext(name, context), printed };
};
