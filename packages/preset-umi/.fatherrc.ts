import { defineConfig } from 'father';

export default defineConfig({
  extends: '../../.fatherrc.base.ts',
  cjs: {
    ignores: ['src/client/*'],
  },
  umd: {
    entry: 'src/client/prefetchRouteFilesScp.ts',
    output: 'templates/routePrefetch',
    chainWebpack(memo) {
      memo.output.filename('prefetchRouteFilesScp.js');
      memo.output.delete('libraryTarget');
      memo.output.iife(true);

      return memo;
    },
  },
});
