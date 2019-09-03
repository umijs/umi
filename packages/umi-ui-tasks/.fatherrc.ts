import glob from 'glob';
import { join } from 'path';

export default [
  {
    target: 'node',
    cjs: { type: 'babel', lazy: true },
    disableTypeCheck: true,
  },
  {
    entry: 'ui/index.tsx',
    typescriptOpts: {
      check: false,
    },
    umd: {
      name: 'tasks',
      minFile: false,
    },
  },
];
