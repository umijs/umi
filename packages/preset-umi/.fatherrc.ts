import { defineConfig } from 'father';

export default defineConfig({
  extends: '../../.fatherrc.base.ts',
  cjs: {
    ignores: ['src/client/*'],
  },
  umd: {
    entry: 'src/client/preloadRouteFilesScp.ts',
    output: 'templates/routePreloadOnLoad',
    chainWebpack(memo) {
      memo.output.filename('preloadRouteFilesScp.js');
      memo.output.delete('libraryTarget');
      memo.output.iife(true);

      return memo;
    },
  },
});
