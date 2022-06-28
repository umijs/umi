import { defineConfig } from 'father';

export default defineConfig({
  extends: '../../.fatherrc.base.ts',
  esm: {
    output: 'client',
    ignores: [
      '!src/client/**',
      '!src/constants.ts',
      '!src/utils/formatWebpackMessages.ts',
    ],
  },
});
