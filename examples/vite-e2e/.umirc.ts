import { resolve } from 'path';

export default {
  vite: {
    optimizeDeps: {
      include: ['invariant'],
    },
  },
  alias: {
    '@xx/utils': resolve('utils/index.ts'),
  },
};
