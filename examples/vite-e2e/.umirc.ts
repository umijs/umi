import { resolve } from 'path';

export default {
  vite: {},
  alias: {
    '@xx/utils': resolve('utils/index.ts'),
  },
  targets: {
    ie: 11,
  },
};
