import { defineConfig } from 'father';

export default defineConfig({
  extends: '../../.fatherrc.base.ts',
  cjs: undefined,
  esm: {
    output: 'dist',
  },
});
