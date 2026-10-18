// QA only: lets `import express from 'express'` resolve to a verified local installation of Express
// (inside the globally installed firebase-tools) without installing packages or creating node_modules in
// the companion project. Usage: node --import <path>/local-deps.mjs ...   Readers use `npm install` instead.
import { register } from 'node:module';

register('./local-deps-hooks.mjs', import.meta.url);
