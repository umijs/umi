import { defineConfig } from 'father';

export default defineConfig({
  dts: {
    compiler: 'tsgo',
  },
  cjs: {
    output: 'dist',
    sourcemap: true,
  },
});
