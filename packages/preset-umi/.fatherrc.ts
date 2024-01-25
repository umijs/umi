import { defineConfig } from 'father';

export default defineConfig({
  extends: '../../.fatherrc.base.ts',
  cjs: {
    ignores: ['src/client/*'],
  },
  esm: {
    ignores: ['!src/client/prefetchRouteFiles.ts'],
    output: 'dist',
  },
  umd: {
    entry: 'src/client/prefetchRouteFilesScp.ts',
    output: 'compiled/prefetchRouteFilesScp',
    chainWebpack(memo) {
      memo.output.filename('index.js');
      memo.output.delete('libraryTarget');
      memo.output.iife(true);

      return memo;
    },
  },
});
