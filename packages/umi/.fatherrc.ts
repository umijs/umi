import { defineConfig } from 'father';

export default defineConfig({
  extends: '../../.fatherrc.base.ts',
  cjs: {
    ignores: ['src/client/**'],
  },
  esm: {
    input: 'src/client',
    output: 'client/client',
  },
});
