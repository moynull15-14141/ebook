import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const ROOT = process.env.LOCAL_DEPS_ROOT
  ?? 'C:/Users/T/AppData/Roaming/npm/node_modules/firebase-tools/node_modules/';
const ALLOWED = new Set(['express']);
const requireFromRoot = createRequire(`${ROOT}noop.js`);

export async function resolve(specifier, context, nextResolve) {
  if (ALLOWED.has(specifier)) {
    return nextResolve(pathToFileURL(requireFromRoot.resolve(specifier)).href, context);
  }
  return nextResolve(specifier, context);
}
