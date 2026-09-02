import { make } from './wrapped-node_modules/entry.mjs';

(globalThis as any).__constructorResult = make().value;
